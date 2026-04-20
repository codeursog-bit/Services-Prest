import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { sendDocumentNotification } from '@/lib/email';
import { apiSuccess, apiError } from '@/lib/utils';

// POST /api/documents/share
// body: { documentId: string, partnerIds: string[] }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const { documentId, partnerIds } = await req.json();

    if (!documentId || !partnerIds?.length) {
      return apiError('documentId et partnerIds requis');
    }

    const source = await prisma.document.findUnique({ where: { id: documentId } });
    if (!source) return apiError('Document introuvable', 404);

    const shared: string[] = [];

    for (const partnerId of partnerIds) {
      const partner = await prisma.partner.findUnique({
        where:  { id: partnerId },
        select: { email: true, orgName: true, token: true, notifyOnDoc: true },
      });
      if (!partner) continue;

      // Créer une copie du document dans l'espace partenaire
      await prisma.document.create({
        data: {
          name:     source.name,
          fileType: source.fileType,
          size:     source.size,
          url:      source.url,
          partnerId,
        },
      });

      // Notification in-app
      await (prisma as any).notification.create({
        data: {
          content:   `Document "${source.name}" partagé avec ${partner.orgName}`,
          type:      'INFO',
          link:      `/dashboard/partners/${partnerId}?tab=documents`,
          partnerId,
        },
      });

      // Email partenaire
      if (partner.notifyOnDoc) {
        const accessLink = `${process.env.NEXT_PUBLIC_APP_URL}/partner/${partner.token}`;
        await sendDocumentNotification({
          to:          partner.email,
          partnerName: partner.orgName,
          docName:     source.name,
          accessLink,
        }).catch(console.error);
      }

      shared.push(partnerId);
    }

    return apiSuccess({ shared });
  } catch (err) {
    console.error('POST /api/documents/share:', err);
    return apiError('Erreur serveur', 500);
  }
}
