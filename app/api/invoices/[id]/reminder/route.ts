import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { sendInvoiceReminder } from '@/lib/email';
import { apiSuccess, apiError, formatDate } from '@/lib/utils';

// POST /api/invoices/[id]/reminder — envoyer un email de relance au partenaire
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const invoice = await prisma.invoice.findUnique({
      where:   { id: params.id },
      include: { partner: { select: { email: true, orgName: true } } },
    });

    if (!invoice)              return apiError('Facture introuvable', 404);
    if (invoice.status === 'PAYE') return apiError('Cette facture est déjà soldée');
    if (!invoice.dueDate)      return apiError('Cette facture n\'a pas de date d\'échéance');

    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/banques`;

    await sendInvoiceReminder({
      to:          invoice.partner.email,
      ref:         invoice.ref,
      partnerName: invoice.partner.orgName,
      amount:      invoice.amount,
      dueDate:     formatDate(invoice.dueDate),
      dashboardLink,
    });

    // Enregistrer la date de relance
    await (prisma as any).invoice.update({
      where: { id: params.id },
      data:  { reminderSentAt: new Date() },
    });

    // Notification in-app
    await (prisma as any).notification.create({
      data: {
        content:   `Relance envoyée pour la facture ${invoice.ref} — ${invoice.partner.orgName}`,
        type:      'INFO',
        link:      `/dashboard/banques`,
        partnerId: invoice.partnerId,
      },
    });

    return apiSuccess({ sent: true });
  } catch (err) {
    console.error('POST /api/invoices/[id]/reminder:', err);
    return apiError('Erreur lors de l\'envoi de la relance', 500);
  }
}
