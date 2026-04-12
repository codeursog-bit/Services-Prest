'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function createInvoice(formData: FormData) {
  const ref = formData.get('ref') as string;
  const description = formData.get('description') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const issueDate = formData.get('issueDate') as string;
  const dueDate = formData.get('dueDate') as string | null;
  const status = formData.get('status') as string;
  const notes = formData.get('notes') as string | null;
  const partnerId = formData.get('partnerId') as string;

  if (!ref || !description || isNaN(amount) || !issueDate || !status || !partnerId) {
    return { success: false, error: 'Champs obligatoires manquants.' };
  }

  try {
    await prisma.invoice.create({
      data: {
        ref,
        description,
        amount,
        issueDate: new Date(issueDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status as any,
        notes: notes || null,
        partnerId,
      }
    });

    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath('/dashboard/banques');
    return { success: true };
  } catch (error) {
    console.error('createInvoice error:', error);
    return { success: false, error: 'Erreur lors de la création de la facture.' };
  }
}

export async function updateInvoiceStatus(id: string, status: string, partnerId: string) {
  try {
    await prisma.invoice.update({
      where: { id },
      data: { status: status as any }
    });
    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath('/dashboard/banques');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur lors de la mise à jour.' };
  }
}

export async function updateInvoice(id: string, formData: FormData, partnerId: string) {
  try {
    const dueDate = formData.get('dueDate') as string | null;
    await prisma.invoice.update({
      where: { id },
      data: {
        description: formData.get('description') as string,
        amount: parseFloat(formData.get('amount') as string),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: formData.get('status') as any,
        notes: formData.get('notes') as string | null,
      }
    });
    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath('/dashboard/banques');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur lors de la mise à jour.' };
  }
}

export async function deleteInvoice(id: string, partnerId: string) {
  try {
    await prisma.invoice.delete({ where: { id } });
    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath('/dashboard/banques');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur lors de la suppression.' };
  }
}