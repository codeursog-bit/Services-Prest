import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

type Ctx = { params: { id: string; noteId: string } };

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    await prisma.marketNote.delete({ where: { id: params.noteId } });
    return apiSuccess({ message: 'Note supprimée' });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Note introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { title, notes, date, participants } = body;

    const note = await prisma.marketNote.update({
      where: { id: params.noteId },
      data: {
        ...(title        !== undefined ? { title: title || null }               : {}),
        ...(notes        !== undefined ? { notes }                              : {}),
        ...(date         !== undefined ? { date: date ? new Date(date) : new Date() } : {}),
        ...(participants !== undefined ? { participants: participants || null } : {}),
      },
    });

    return apiSuccess({ note });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Note introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
