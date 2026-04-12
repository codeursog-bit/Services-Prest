'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function upsertMarcheNote(
  partnerId: string,
  category: string,
  notes: string,
  metadata?: { date?: string; participants?: string }
) {
  try {
    await prisma.marketNote.create({
      data: {
        partnerId,
        category,
        notes,
        date: metadata?.date ? new Date(metadata.date) : new Date(),
        participants: metadata?.participants || null,
      }
    });
    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath('/dashboard/marche');
    return { success: true };
  } catch (error) {
    console.error('upsertMarcheNote error:', error);
    return { success: false, error: 'Erreur lors de la sauvegarde.' };
  }
}

// Fix: findFirst + create/update car @unique supprimé sur partnerId
export async function updateExecutionLevel(
  partnerId: string,
  percentage: number,
  phase: string,
  nextStep: string,
  closingDate: string
) {
  try {
    const existing = await prisma.market.findFirst({ where: { partnerId } });
    if (existing) {
      await prisma.market.update({
        where: { id: existing.id },
        data: {
          executionRate: percentage,
          phase,
          nextStep: nextStep || null,
          closingDate: closingDate ? new Date(closingDate) : null,
        }
      });
    } else {
      await prisma.market.create({
        data: {
          partnerId,
          executionRate: percentage,
          phase,
          nextStep: nextStep || null,
          closingDate: closingDate ? new Date(closingDate) : null,
        }
      });
    }
    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath('/dashboard/marche');
    return { success: true };
  } catch (error) {
    console.error('updateExecutionLevel error:', error);
    return { success: false, error: 'Erreur lors de la mise à jour.' };
  }
}

export async function updateNextReviewDate(partnerId: string, date: string) {
  try {
    const existing = await prisma.market.findFirst({ where: { partnerId } });
    if (existing) {
      await prisma.market.update({ where: { id: existing.id }, data: { nextReviewDate: new Date(date) } });
    } else {
      await prisma.market.create({ data: { partnerId, executionRate: 0, phase: 'Initialisation', nextReviewDate: new Date(date) } });
    }
    revalidatePath(`/dashboard/partners/${partnerId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur lors de la mise à jour.' };
  }
}

export async function createContentieux(partnerId: string, data: {
  subject: string; description?: string; openDate: string; status: string;
}) {
  try {
    await prisma.contentieux.create({
      data: {
        partnerId,
        subject: data.subject,
        description: data.description || null,
        openDate: new Date(data.openDate),
        status: data.status as any,
      }
    });
    revalidatePath(`/dashboard/partners/${partnerId}`);
    return { success: true };
  } catch (error) {
    console.error('createContentieux error:', error);
    return { success: false, error: 'Erreur lors de la création.' };
  }
}

export async function updateContentieux(id: string, status: string) {
  try {
    const updated = await prisma.contentieux.update({ where: { id }, data: { status: status as any } });
    revalidatePath(`/dashboard/partners/${updated.partnerId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur lors de la mise à jour.' };
  }
}

export async function deleteContentieux(id: string, partnerId: string) {
  try {
    await prisma.contentieux.delete({ where: { id } });
    revalidatePath(`/dashboard/partners/${partnerId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur lors de la suppression.' };
  }
}
