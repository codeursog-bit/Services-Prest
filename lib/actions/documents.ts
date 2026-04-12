'use server';

import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import prisma from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Client S3/Minio ──────────────────────────────────────────────────────────
function getS3Client() {
  return new S3Client({
    endpoint: `${process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY!,
      secretAccessKey: process.env.MINIO_SECRET_KEY!,
    },
    forcePathStyle: true,
  });
}

async function uploadToS3(file: File, key: string): Promise<string> {
  const s3 = getS3Client();
  const buffer = Buffer.from(await file.arrayBuffer());
  await s3.send(new PutObjectCommand({
    Bucket: process.env.MINIO_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  }));
  return `${process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET_NAME}/${key}`;
}

async function deleteFromS3(url: string) {
  try {
    const s3 = getS3Client();
    const key = url.split(`/${process.env.MINIO_BUCKET_NAME}/`)[1];
    if (!key) return;
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.MINIO_BUCKET_NAME!, Key: key }));
  } catch (e) {
    console.error('deleteFromS3 error:', e);
  }
}

// ── Template email partenaire ────────────────────────────────────────────────
function partnerNotifHtml(partnerName: string, docName: string, accessLink: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1A1A19;">
      <div style="border-bottom:2px solid #1A3A5C;padding-bottom:16px;margin-bottom:24px;">
        <strong style="font-size:16px;">Melanie Services&amp;Prest.</strong>
        <span style="display:block;font-size:12px;color:#6B6A67;margin-top:4px;">Votre partenaire idéal !</span>
      </div>
      <p>Madame, Monsieur,</p>
      <p>La société <strong>Melanie Services&amp;Prest.</strong> vient de partager un nouveau document dans votre espace commun.</p>
      <p style="background:#F7F7F6;padding:12px 16px;border-radius:6px;border-left:3px solid #1A3A5C;">
        📄 <strong>${docName}</strong>
      </p>
      <p>Vous pouvez le consulter dès à présent en cliquant sur le lien ci-dessous :</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="${accessLink}" style="background:#1A3A5C;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;">
          Accéder à mon espace
        </a>
      </p>
      <hr style="border:none;border-top:1px solid #E8E7E4;margin:32px 0;"/>
      <p style="font-size:12px;color:#6B6A67;">
        Très cordialement,<br/>
        <strong>Melanie Services&amp;Prest.</strong><br/>
        <em>Votre partenaire idéal !</em>
      </p>
    </div>
  `;
}

// ── Upload document partenaire ───────────────────────────────────────────────
export async function uploadDocument(formData: FormData) {
  const file = formData.get('file') as File;
  const partnerId = formData.get('partnerId') as string;
  const category = formData.get('category') as string | null;

  if (!file || file.size === 0 || !partnerId) return { success: false, error: 'Fichier manquant.' };

  try {
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: { email: true, orgName: true, notifyOnDoc: true, token: true },
    });
    if (!partner) return { success: false, error: 'Partenaire introuvable.' };

    const key = `partners/${partnerId}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const fileUrl = await uploadToS3(file, key);
    const fileSizeMb = (file.size / 1024 / 1024).toFixed(2) + ' Mo';

    const doc = await prisma.document.create({
      data: { name: file.name, fileType: file.type, size: fileSizeMb, url: fileUrl, category: category || null, partnerId },
    });

    // Notification in-app
    await prisma.notification.create({
      data: { content: `Document "${file.name}" partagé avec ${partner.orgName}`, partnerId },
    });

    // Email partenaire
    if (partner.notifyOnDoc) {
      const accessLink = `${process.env.NEXT_PUBLIC_APP_URL}/partner/${partner.token}`;
      await resend.emails.send({
        from: 'Melanie Services <noreply@melanieservices.com>',
        to: partner.email,
        subject: 'Melanie Services&Prest. — Nouveau document partagé',
        html: partnerNotifHtml(partner.orgName, file.name, accessLink),
      });
    }

    revalidatePath(`/dashboard/partners/${partnerId}`);
    return { success: true, documentId: doc.id };
  } catch (error) {
    console.error('uploadDocument error:', error);
    return { success: false, error: "Erreur lors de l'upload." };
  }
}

// ── Upload document entreprise (coffre-fort) ─────────────────────────────────
export async function uploadCompanyDocument(formData: FormData) {
  const file = formData.get('file') as File;
  const category = formData.get('category') as string;
  const validityDate = formData.get('validityDate') as string | null;

  if (!file || file.size === 0 || !category) return { success: false, error: 'Fichier et catégorie requis.' };

  try {
    const key = `company/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const fileUrl = await uploadToS3(file, key);
    const fileSizeMb = (file.size / 1024 / 1024).toFixed(2) + ' Mo';

    await prisma.document.create({
      data: {
        name: file.name,
        fileType: file.type,
        size: fileSizeMb,
        url: fileUrl,
        category,
        partnerId: null,
        validityDate: validityDate ? new Date(validityDate) : null,
      },
    });

    revalidatePath('/dashboard/documents');
    return { success: true };
  } catch (error) {
    console.error('uploadCompanyDocument error:', error);
    return { success: false, error: "Erreur lors de l'upload." };
  }
}

// ── Suppression document ─────────────────────────────────────────────────────
export async function deleteDocument(id: string, partnerId?: string) {
  try {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return { success: false, error: 'Document introuvable.' };

    await deleteFromS3(doc.url);
    await prisma.document.delete({ where: { id } });

    if (partnerId) revalidatePath(`/dashboard/partners/${partnerId}`);
    else revalidatePath('/dashboard/documents');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur lors de la suppression.' };
  }
}

// ── Tracking consultation ────────────────────────────────────────────────────
export async function markDocumentViewed(documentId: string, ipHash?: string) {
  try {
    await prisma.documentView.create({ data: { documentId, ipHash: ipHash || null } });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// ── Partage document coffre-fort vers partenaires ────────────────────────────
export async function shareDocumentWithPartner(documentId: string, partnerIds: string[]) {
  try {
    const sourceDoc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!sourceDoc) return { success: false, error: 'Document introuvable.' };

    for (const partnerId of partnerIds) {
      const partner = await prisma.partner.findUnique({
        where: { id: partnerId },
        select: { email: true, orgName: true, notifyOnDoc: true, token: true },
      });
      if (!partner) continue;

      await prisma.document.create({
        data: { name: sourceDoc.name, fileType: sourceDoc.fileType, size: sourceDoc.size, url: sourceDoc.url, partnerId },
      });

      await prisma.notification.create({
        data: { content: `Document "${sourceDoc.name}" partagé avec ${partner.orgName}`, partnerId },
      });

      if (partner.notifyOnDoc) {
        const accessLink = `${process.env.NEXT_PUBLIC_APP_URL}/partner/${partner.token}`;
        await resend.emails.send({
          from: 'Melanie Services <noreply@melanieservices.com>',
          to: partner.email,
          subject: 'Melanie Services&Prest. — Nouveau document partagé',
          html: partnerNotifHtml(partner.orgName, sourceDoc.name, accessLink),
        });
      }
    }

    revalidatePath('/dashboard/documents');
    return { success: true };
  } catch (error) {
    console.error('shareDocumentWithPartner error:', error);
    return { success: false, error: 'Erreur lors du partage.' };
  }
}

// ── Upload contrat ────────────────────────────────────────────────────────────
export async function uploadContract(formData: FormData) {
  const file = formData.get('file') as File;
  const versionName = formData.get('versionName') as string;
  const authorId = formData.get('authorId') as string;

  if (!file || file.size === 0 || !versionName || !authorId) {
    return { success: false, error: 'Données manquantes.' };
  }

  try {
    const key = `contracts/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const fileUrl = await uploadToS3(file, key);

    await prisma.contractVersion.create({ data: { versionName, fileUrl, authorId } });

    revalidatePath('/dashboard/contrat');
    return { success: true };
  } catch (error) {
    console.error('uploadContract error:', error);
    return { success: false, error: "Erreur lors de l'upload du contrat." };
  }
}