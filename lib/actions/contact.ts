'use server';

import { Resend } from 'resend';

// Initialisation de Resend avec la clé d'API issue des variables d'environnement
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactMessage(formData: FormData) {
  // Récupération des champs
  const name = formData.get('name') as string;
  const company = formData.get('company') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  // Validation côté serveur
  if (!name || !email || !subject || !message) {
    return { success: false, error: 'Veuillez remplir tous les champs obligatoires.' };
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Contact Melanie Services <onboarding@resend.dev>', // Utilisez votre domaine vérifié en production
      to: process.env.CONTACT_EMAIL || 'contact@melanieservices.com',
      subject: `[Contact] ${subject} — ${name}`,
      html: `
        <h2>Nouveau message depuis le site web</h2>
        <p><strong>Nom complet :</strong> ${name}</p>
        <p><strong>Société / Organisation :</strong> ${company || 'Non renseignée'}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
        <p><strong>Objet :</strong> ${subject}</p>
        <hr style="border: none; border-top: 1px solid #E8E7E4; margin: 20px 0;" />
        <h3>Message :</h3>
        <p style="white-space: pre-wrap; color: #1A1A19; line-height: 1.6;">${message}</p>
      `,
    });

    if (error) {
      return { success: false, error: "Une erreur technique est survenue lors de l'envoi." };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Une erreur inattendue s'est produite." };
  }
}