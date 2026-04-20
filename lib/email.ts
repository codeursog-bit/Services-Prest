import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Melanie Services <noreply@melanieservices.com>';

// Template commun MSP
function baseTemplate(body: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1A1A19;">
      <div style="border-bottom:2px solid #1A3A5C;padding-bottom:14px;margin-bottom:24px;">
        <strong style="font-size:15px;color:#1A3A5C;">Melanie Services&amp;Prest.</strong>
        <span style="display:block;font-size:11px;color:#6B6A67;margin-top:2px;">Votre partenaire idéal !</span>
      </div>
      ${body}
      <hr style="border:none;border-top:1px solid #E8E7E4;margin:28px 0 16px;"/>
      <p style="font-size:12px;color:#6B6A67;margin:0;">
        Très cordialement,<br/>
        <strong style="color:#1A3A5C;">Melanie Services&amp;Prest.</strong><br/>
        <em>Votre partenaire idéal !</em>
      </p>
    </div>
  `;
}

// Email envoyé au partenaire quand un document est partagé
export async function sendDocumentNotification({
  to,
  partnerName,
  docName,
  accessLink,
}: {
  to: string;
  partnerName: string;
  docName: string;
  accessLink: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Melanie Services&Prest. — Nouveau document partagé',
    html: baseTemplate(`
      <p>Madame, Monsieur,</p>
      <p>La société <strong>Melanie Services&amp;Prest.</strong> vient de partager un nouveau document dans votre espace commun.</p>
      <div style="background:#F7F7F6;border-left:3px solid #1A3A5C;padding:10px 14px;border-radius:0 6px 6px 0;margin:16px 0;">
        📄 <strong>${docName}</strong>
      </div>
      <p>Vous pouvez le consulter dès à présent.</p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${accessLink}" style="background:#1A3A5C;color:#fff;padding:11px 22px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:500;">
          Accéder à mon espace
        </a>
      </p>
    `),
  });
}

// Email envoyé au partenaire quand une information lui est transmise
export async function sendMessageNotification({
  to,
  subject,
  content,
  accessLink,
}: {
  to: string;
  subject: string;
  content: string;
  accessLink: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${subject} — Melanie Services&Prest.`,
    html: baseTemplate(`
      <p>Madame, Monsieur,</p>
      <p>${content.replace(/\n/g, '<br/>')}</p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${accessLink}" style="background:#1A3A5C;color:#fff;padding:11px 22px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:500;">
          Consulter mon espace
        </a>
      </p>
    `),
  });
}

// Email envoyé au partenaire à sa création (lien d'accès)
export async function sendPartnerWelcome({
  to,
  orgName,
  accessLink,
}: {
  to: string;
  orgName: string;
  accessLink: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Melanie Services&Prest. — Votre espace partenaire est prêt',
    html: baseTemplate(`
      <p>Madame, Monsieur,</p>
      <p>La société <strong>Melanie Services&amp;Prest.</strong> vous a ouvert un espace de collaboration sécurisé.</p>
      <p>Cet espace vous permettra de :</p>
      <ul style="font-size:13px;color:#1A1A19;line-height:2;">
        <li>Consulter les documents partagés</li>
        <li>Suivre les informations transmises</li>
        <li>Communiquer avec l'équipe MSP</li>
      </ul>
      <p style="text-align:center;margin:28px 0;">
        <a href="${accessLink}" style="background:#1A3A5C;color:#fff;padding:11px 22px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:500;">
          Accéder à mon espace
        </a>
      </p>
      <p style="font-size:12px;color:#6B6A67;">Ce lien vous est personnel. Ne le partagez pas.</p>
    `),
  });
}

// Email de réinitialisation de mot de passe
export async function sendPasswordReset({
  to,
  resetLink,
}: {
  to: string;
  resetLink: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: '[MSP] Réinitialisation de votre mot de passe',
    html: baseTemplate(`
      <p>Madame, Monsieur,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${resetLink}" style="background:#1A3A5C;color:#fff;padding:11px 22px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:500;">
          Réinitialiser mon mot de passe
        </a>
      </p>
      <p style="font-size:12px;color:#6B6A67;">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    `),
  });
}

// Alerte admin : début ou fin d'une étape de marché
export async function sendMarketStepAlert({
  to,
  marketName,
  stepTitle,
  alertType,
  partnerName,
  dashboardLink,
}: {
  to: string;
  marketName: string;
  stepTitle: string;
  alertType: 'START' | 'END';
  partnerName: string;
  dashboardLink: string;
}) {
  const isStart = alertType === 'START';
  return resend.emails.send({
    from: FROM,
    to,
    subject: `[MSP] Alerte marché — ${isStart ? 'Début' : 'Fin'} : ${stepTitle}`,
    html: baseTemplate(`
      <p>${isStart ? '🟢' : '🔴'} <strong>${isStart ? 'Début' : 'Fin'} d'étape</strong></p>
      <div style="background:#F7F7F6;border-left:3px solid #1A3A5C;padding:10px 14px;border-radius:0 6px 6px 0;margin:16px 0;font-size:13px;">
        <strong>Marché :</strong> ${marketName}<br/>
        <strong>Partenaire :</strong> ${partnerName}<br/>
        <strong>Étape :</strong> ${stepTitle}
      </div>
      <p style="text-align:center;margin:28px 0;">
        <a href="${dashboardLink}" style="background:#1A3A5C;color:#fff;padding:11px 22px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:500;">
          Voir le suivi
        </a>
      </p>
    `),
  });
}

// Alerte admin : facture en retard de paiement
export async function sendInvoiceReminder({
  to,
  ref,
  partnerName,
  amount,
  dueDate,
  dashboardLink,
}: {
  to: string;
  ref: string;
  partnerName: string;
  amount: number;
  dueDate: string;
  dashboardLink: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `[MSP] Relance — Facture ${ref} en attente`,
    html: baseTemplate(`
      <p>⚠️ La facture suivante est en attente de règlement :</p>
      <div style="background:#FEF3E2;border-left:3px solid #8B4513;padding:10px 14px;border-radius:0 6px 6px 0;margin:16px 0;font-size:13px;">
        <strong>Référence :</strong> ${ref}<br/>
        <strong>Partenaire :</strong> ${partnerName}<br/>
        <strong>Montant :</strong> ${amount.toLocaleString('fr-FR')} FCFA<br/>
        <strong>Échéance :</strong> ${dueDate}
      </div>
      <p style="text-align:center;margin:28px 0;">
        <a href="${dashboardLink}" style="background:#1A3A5C;color:#fff;padding:11px 22px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:500;">
          Gérer la facture
        </a>
      </p>
    `),
  });
}
