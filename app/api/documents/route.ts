import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { uploadFile, formatSize } from '@/lib/s3';
import { sendDocumentNotification } from '@/lib/email';
import { apiSuccess, apiError } from '@/lib/utils';

// GET /api/documents?partnerId=xxx   → docs d'un partenaire
// GET /api/documents?company=true    → docs coffre-fort entreprise
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  const { searchParams } = req.nextUrl;
  const partnerId = searchParams.get('partnerId');
  const company   = searchParams.get('company');

  try {
    if (partnerId) {
      const documents = await prisma.document.findMany({
        where: { partnerId },
        orderBy: { createdAt: 'desc' },
        include: {
          views: {
            orderBy: { viewedAt: 'desc' },
            take: 1,
          },
        },
      });
      return apiSuccess({ documents });
    }

    if (company === 'true') {
      const documents = await prisma.document.findMany({
        where: { partnerId: null },
        orderBy: { createdAt: 'desc' },
      });
      return apiSuccess({ documents });
    }

    return apiError('Paramètre manquant : partnerId ou company=true');
  } catch (err) {
    console.error('GET /api/documents:', err);
    return apiError('Erreur serveur', 500);
  }
}

// POST /api/documents  → upload d'un document (partenaire ou entreprise)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const formData  = await req.formData();
    const file      = formData.get('file')      as File | null;
    const partnerId = formData.get('partnerId') as string | null;
    const category  = formData.get('category')  as string | null;
    const validity  = formData.get('validityDate') as string | null;

    if (!file || file.size === 0) return apiError('Fichier manquant');
    if (file.size > 50 * 1024 * 1024) return apiError('Fichier trop volumineux (max 50 Mo)');

    // Upload S3
    const folder  = partnerId ? `partners/${partnerId}` : 'company';
    const fileUrl = await uploadFile(file, folder);
    const size    = formatSize(file.size);

    const document = await prisma.document.create({
      data: {
        name:         file.name,
        fileType:     file.type,
        size,
        url:          fileUrl,
        category:     category  || null,
        validityDate: validity  ? new Date(validity) : null,
        partnerId:    partnerId || null,
      },
    });

    // Si document partagé avec un partenaire → email + notification in-app
    if (partnerId) {
      const partner = await prisma.partner.findUnique({
        where:  { id: partnerId },
        select: { email: true, orgName: true, token: true, notifyOnDoc: true },
      });

      if (partner) {
        await prisma.notification.create({
          data: {
            content:   `Document "${file.name}" partagé avec ${partner.orgName}`,
            type:      'INFO',
            link:      `/dashboard/partners/${partnerId}?tab=documents`,
            partnerId,
          },
        });

        if (partner.notifyOnDoc) {
          const accessLink = `${process.env.NEXT_PUBLIC_APP_URL}/partner/${partner.token}`;
          await sendDocumentNotification({
            to:          partner.email,
            partnerName: partner.orgName,
            docName:     file.name,
            accessLink,
          }).catch(console.error);
        }
      }
    }

    return apiSuccess({ document }, 201);
  } catch (err) {
    console.error('POST /api/documents:', err);
    return apiError('Erreur lors de l\'upload', 500);
  }
}
