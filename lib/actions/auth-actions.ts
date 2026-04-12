'use server';

import { Resend } from 'resend';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

// Vérification PIN de verrouillage session
export async function verifyPin(pin: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: 'Session invalide.' };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false, error: 'Utilisateur introuvable.' };

    // Le PIN est stocké hashé comme le mot de passe
    // Si pas encore défini, PIN par défaut = 4 premiers chiffres de l'ID hashé
    // En production : stocker un champ `pin` hashé sur l'utilisateur
    // Pour l'instant on vérifie contre le mot de passe (à remplacer par un vrai champ PIN)
    const isValid = await bcrypt.compare(pin, user.password);
    if (isValid) return { success: true };

    return { success: false, error: 'Code incorrect. Réessayez.' };
  } catch (error) {
    console.error('verifyPin error:', error);
    return { success: false, error: 'Erreur serveur.' };
  }
}

// Demande de réinitialisation de mot de passe
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return { success: false, error: "L'email est requis." };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Par sécurité : même réponse si l'email n'existe pas
    if (!user) return { success: true, email };

    // Supprimer les anciens tokens pour cet email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 3600000); // 1h

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt }
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'Melanie Services <onboarding@resend.dev>',
      to: email,
      subject: '[Melanie Services&Prest.] Réinitialisation de mot de passe',
      html: `
        <p>Madame, Monsieur,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
        <p><a href="${resetLink}">Réinitialiser mon mot de passe</a></p>
        <p><em>Ce lien expirera dans 1 heure.</em></p>
        <br/>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <br/>
        <p>Très cordialement,<br/><strong>Melanie Services&Prest.</strong><br/><em>Votre partenaire idéal !</em></p>
      `,
    });

    return { success: true, email };
  } catch (error) {
    console.error('requestPasswordReset error:', error);
    return { success: false, error: 'Une erreur est survenue. Réessayez.' };
  }
}

// Réinitialisation effective du mot de passe
export async function resetPasswordAction(token: string, formData: FormData) {
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  if (!password || password.length < 8) {
    return { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }

  if (password !== confirm) {
    return { success: false, error: 'Les mots de passe ne correspondent pas.' };
  }

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return { success: false, error: 'Lien invalide ou expiré. Faites une nouvelle demande.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    });

    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    return { success: true };
  } catch (error) {
    console.error('resetPasswordAction error:', error);
    return { success: false, error: 'Une erreur est survenue. Réessayez.' };
  }
}

// Mise à jour du profil utilisateur
export async function updateProfile(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: 'Non authentifié.' };

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;

    await prisma.user.update({
      where: { email: session.user.email },
      data: { name, phone: phone || null }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur lors de la mise à jour.' };
  }
}

// Changement de mot de passe depuis les paramètres
export async function changePassword(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: 'Non authentifié.' };

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirm = formData.get('confirm') as string;

    if (newPassword !== confirm) {
      return { success: false, error: 'Les mots de passe ne correspondent pas.' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'Minimum 8 caractères requis.' };
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false, error: 'Utilisateur introuvable.' };

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return { success: false, error: 'Mot de passe actuel incorrect.' };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur lors du changement.' };
  }
}