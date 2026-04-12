'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createPartner(formData: FormData) {
  const orgName = formData.get('orgName') as string;
  const contactName = formData.get('contactName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const type = formData.get('type') as string;
  const sector = formData.get('sector') as string;
  const address = formData.get('address') as string;
  const notes = formData.get('notes') as string;
  const notifyOnDoc = formData.get('notifyOnDoc') === 'on';
  const notifyAdmin = formData.get('notifyAdmin') === 'on';

  if (!orgName || !contactName || !email || !type) {
    return { success: false, error: 'Veuillez remplir tous les champs obligatoires.' };
  }

  const partnerToken = crypto.randomUUID();
  let newPartnerId = '';

  try {
    const newPartner = await prisma.partner.create({
      data: {
        orgName,
        contactName,
        email,
        phone: phone || null,
        type: type as any,
        sector: sector || null,
        address: address || null,
        notes: notes || null,
        token: partnerToken,
        status: 'ACTIF',
        notifyOnDoc,
        notifyAdmin,
      }
    });

    newPartnerId = newPartner.id;

    const accessLink = `${process.env.NEXT_PUBLIC_APP_URL}/partner/${partnerToken}`;

    await resend.emails.send({
      from: 'Melanie Services <onboarding@resend.dev>',
      to: email,
      subject: 'Melanie Services&Prest. vous a ouvert un espace partenaire',
      html: `
        <p>Madame, Monsieur,</p>
        <p>La société <strong>Melanie Services&Prest.</strong> vous a créé un espace de collaboration sécurisé.</p>
        <p>Vous pouvez y accéder à l'adresse suivante : <a href="${accessLink}">${accessLink}</a></p>
        <p>Votre espace vous permettra de consulter les documents partagés et les informations transmises par Melanie Services&Prest.</p>
        <p>Très cordialement,<br/><strong>Melanie Services&Prest.</strong><br/><em>Votre partenaire idéal !</em></p>
      `
    });

  } catch (error) {
    console.error('createPartner error:', error);
    return { success: false, error: 'Une erreur est survenue lors de la création du partenaire.' };
  }

  redirect(`/dashboard/partners/${newPartnerId}`);
}

export async function updatePartner(id: string, formData: FormData) {
  const orgName = formData.get('orgName') as string;
  const contactName = formData.get('contactName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const type = formData.get('type') as string;
  const sector = formData.get('sector') as string;
  const address = formData.get('address') as string;
  const notes = formData.get('notes') as string;

  try {
    await prisma.partner.update({
      where: { id },
      data: {
        orgName,
        contactName,
        email,
        phone: phone || null,
        type: type as any,
        sector: sector || null,
        address: address || null,
        notes: notes || null,
      }
    });

    revalidatePath(`/dashboard/partners/${id}`);
    revalidatePath('/dashboard/partners');
    return { success: true };
  } catch (error) {
    console.error('updatePartner error:', error);
    return { success: false, error: 'Une erreur est survenue lors de la mise à jour.' };
  }
}

export async function togglePartnerStatus(id: string, status: 'ACTIF' | 'INACTIF') {
  try {
    await prisma.partner.update({
      where: { id },
      data: { status }
    });
    revalidatePath('/dashboard/partners');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur lors du changement de statut.' };
  }
}

export async function deletePartner(id: string) {
  try {
    await prisma.partner.delete({ where: { id } });
    revalidatePath('/dashboard/partners');
  } catch (error) {
    return { success: false, error: 'Erreur lors de la suppression.' };
  }
  redirect('/dashboard/partners');
}