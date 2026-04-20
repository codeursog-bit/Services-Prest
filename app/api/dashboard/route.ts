import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

// GET /api/dashboard — toutes les statistiques pour la page d'accueil
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    // Exécuter toutes les requêtes en parallèle pour la performance
    const [
      totalPartners,
      activePartners,
      totalMarkets,
      activeMarkets,
      totalDocuments,
      unreadMessages,
      unreadNotifs,
      invoiceStats,
      expiringDocs,
      recentPartners,
      recentActivity,
      lateInvoices,
      activeSteps,
    ] = await Promise.all([
      // Comptes partenaires
      prisma.partner.count(),
      prisma.partner.count({ where: { status: 'ACTIF' } }),

      // Marchés
      (prisma as any).market.count(),
      (prisma as any).market.count({ where: { status: 'EN_COURS' } }),

      // Documents
      prisma.document.count(),

      // Messages non lus (partenaires → MSP)
      (prisma as any).message.count({ where: { direction: 'PARTNER_TO_MSP', isRead: false } }),

      // Notifications non lues
      prisma.notification.count({ where: { isRead: false } }),

      // Statistiques factures
      prisma.invoice.aggregate({
        _sum: { amount: true },
        _count: true,
      }),

      // Documents expirant dans 30 jours
      prisma.document.findMany({
        where: {
          validityDate: {
            not:  null,
            gte:  new Date(),
            lte:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          partnerId: null, // docs entreprise uniquement
        },
        select: { id: true, name: true, validityDate: true, category: true },
        orderBy: { validityDate: 'asc' },
        take: 5,
      }),

      // 5 partenaires les plus récents
      prisma.partner.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, orgName: true, type: true,
          status: true, createdAt: true,
          _count: { select: { documents: true, markets: true } },
        },
      }),

      // Activité récente — derniers messages et docs
      prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          partner: { select: { id: true, orgName: true } },
        },
      }),

      // Factures en retard
      prisma.invoice.findMany({
        where: {
          status:  { not: 'PAYE' },
          dueDate: { lt: new Date() },
        },
        include: { partner: { select: { orgName: true } } },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),

      // Étapes de marché en cours ou en retard
      (prisma as any).marketStep.findMany({
        where: {
          status: { in: ['EN_COURS', 'RETARD'] },
        },
        include: {
          market: {
            include: {
              partner: { select: { orgName: true } },
            },
          },
        },
        orderBy: { endDate: 'asc' },
        take: 5,
      }),
    ]);

    // Calcul taux d'encaissement
    const totalFacture = invoiceStats._sum.amount || 0;
    const totalPaye    = await prisma.invoice.aggregate({
      where: { status: 'PAYE' },
      _sum:  { amount: true },
    });
    const encaisse = totalPaye._sum.amount || 0;

    return apiSuccess({
      stats: {
        totalPartners,
        activePartners,
        totalMarkets,
        activeMarkets,
        totalDocuments,
        unreadMessages,
        unreadNotifs,
        totalFacture,
        encaisse,
        enAttenteFacture: totalFacture - encaisse,
        lateInvoicesCount: lateInvoices.length,
      },
      expiringDocs,
      recentPartners,
      recentActivity,
      lateInvoices,
      activeSteps,
    });
  } catch (err) {
    console.error('GET /api/dashboard:', err);
    return apiError('Erreur serveur', 500);
  }
}
