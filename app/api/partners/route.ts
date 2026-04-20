import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status'); // ACTIF | INACTIF | EN_ATTENTE | null = tous
  const type   = searchParams.get('type');   // CLIENT | FOURNISSEUR | etc | null = tous
  const search = searchParams.get('search'); // Recherche texte

  try {
    const partners = await prisma.partner.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(type   ? { type:   type   as any } : {}),
        ...(search ? {
          OR: [
            { orgName:     { contains: search, mode: 'insensitive' } },
            { contactName: { contains: search, mode: 'insensitive' } },
            { email:       { contains: search, mode: 'insensitive' } },
            { sector:      { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id:          true,
        orgName:     true,
        contactName: true,
        email:       true,
        phone:       true,
        type:        true,
        sector:      true,
        status:      true,
        token:       true,
        createdAt:   true,
        _count: {
          select: {
            documents: true,
            messages:  true,
            invoices:  true,
            markets:   true,
          },
        },
      },
    });

    return apiSuccess({ partners });
  } catch (err) {
    console.error('GET /api/partners:', err);
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { orgName, contactName, email, phone, type, sector, address, notes, notifyOnDoc, notifyAdmin } = body;

    if (!orgName || !contactName || !email || !type) {
      return apiError('Champs obligatoires manquants');
    }

    const { randomUUID } = await import('crypto');
    const token = randomUUID();

    const partner = await prisma.partner.create({
      data: {
        orgName,
        contactName,
        email,
        phone:       phone       || null,
        type:        type        as any,
        sector:      sector      || null,
        address:     address     || null,
        notes:       notes       || null,
        token,
        notifyOnDoc: notifyOnDoc !== false,
        notifyAdmin: notifyAdmin !== false,
      },
    });

    // Notification in-app
    await (prisma as any).notification.create({
      data: {
        content:   `Nouveau partenaire créé : ${orgName}`,
        type:      'INFO',
        link:      `/dashboard/partners/${partner.id}`,
        partnerId: partner.id,
      },
    });

    // Email de bienvenue au partenaire
    const { sendPartnerWelcome } = await import('@/lib/email');
    const accessLink = `${process.env.NEXT_PUBLIC_APP_URL}/partner/${token}`;
    await sendPartnerWelcome({ to: email, orgName, accessLink }).catch(console.error);

    return apiSuccess({ partner }, 201);
  } catch (err: any) {
    console.error('POST /api/partners:', err);
    if (err.code === 'P2002') return apiError('Un partenaire avec cet email existe déjà');
    return apiError('Erreur serveur', 500);
  }
}
