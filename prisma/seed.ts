import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── ADMIN USER ───────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@melanieservices.com' },
    update: {},
    create: {
      name: 'Marie Laure',
      email: 'admin@melanieservices.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user:', admin.email);

  // ─── PARTENAIRES ─────────────────────────────────────────────────
  const partnerAlpha = await prisma.partner.upsert({
    where: { token: 'token-alpha-001' },
    update: {},
    create: {
      orgName: 'Société Alpha SA',
      contactName: 'Jean Dupont',
      email: 'j.dupont@alpha.sa',
      phone: '+242 06 111 2222',
      type: 'FOURNISSEUR',
      sector: 'Génie civil',
      address: 'Pointe-Noire, République du Congo',
      token: 'token-alpha-001',
      status: 'ACTIF',
      notifyOnDoc: true,
      notifyAdmin: true,
    },
  });

  const partnerBeta = await prisma.partner.upsert({
    where: { token: 'token-beta-002' },
    update: {},
    create: {
      orgName: 'Entreprise Beta SARL',
      contactName: 'Claire Martin',
      email: 'c.martin@beta.sarl',
      phone: '+242 05 333 4444',
      type: 'CLIENT',
      sector: 'Hydrocarbures & Gaz',
      address: 'Brazzaville, République du Congo',
      token: 'token-beta-002',
      status: 'ACTIF',
      notifyOnDoc: true,
      notifyAdmin: false,
    },
  });

  const partnerGamma = await prisma.partner.upsert({
    where: { token: 'token-gamma-003' },
    update: {},
    create: {
      orgName: 'Construction & Co',
      contactName: 'Paul Nguema',
      email: 'p.nguema@construction.co',
      type: 'SOUS_TRAITANT',
      sector: 'QHSE',
      token: 'token-gamma-003',
      status: 'ACTIF',
      notifyOnDoc: true,
      notifyAdmin: true,
    },
  });

  console.log('✅ 3 partenaires créés');

  // ─── DOCUMENTS ───────────────────────────────────────────────────
  await prisma.document.createMany({
    data: [
      {
        name: 'Kbis_Melanie_Services_2026.pdf',
        fileType: 'PDF',
        size: '1.2 Mo',
        url: 'https://example.com/docs/kbis.pdf',
        category: 'RC',
        partnerId: partnerAlpha.id,
      },
      {
        name: 'Attestation_Fiscale_2026.pdf',
        fileType: 'PDF',
        size: '0.8 Mo',
        url: 'https://example.com/docs/fisc.pdf',
        category: 'FISC',
        validityDate: new Date('2026-12-31'),
        partnerId: partnerAlpha.id,
      },
      {
        name: 'Certification_ISO9001_QHSE.pdf',
        fileType: 'PDF',
        size: '3.1 Mo',
        url: 'https://example.com/docs/iso.pdf',
        category: 'QHSE',
        validityDate: new Date('2026-06-30'),
        partnerId: partnerBeta.id,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Documents créés');

  // ─── MESSAGES (infos à transmettre) ──────────────────────────────
  await prisma.message.createMany({
    data: [
      {
        subject: 'Mise à jour des protocoles QHSE',
        content: 'Bonjour, veuillez trouver ci-joint les nouveaux protocoles applicables à compter du 1er février 2026. Merci de les diffuser à vos équipes.',
        authorId: admin.id,
        partnerId: partnerAlpha.id,
      },
      {
        subject: 'Rappel facturation décembre',
        content: 'Nous sommes en attente de la facture concernant les travaux de décembre. Merci de nous la transmettre dans les meilleurs délais.',
        authorId: admin.id,
        partnerId: partnerBeta.id,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Messages créés');

  // ─── FACTURES ────────────────────────────────────────────────────
  await prisma.invoice.createMany({
    data: [
      {
        ref: 'FAC-2026-041',
        description: 'Prestation technique Janvier',
        amount: 4_500_000,
        issueDate: new Date('2026-01-10'),
        dueDate: new Date('2026-02-10'),
        status: 'EN_COURS',
        partnerId: partnerAlpha.id,
      },
      {
        ref: 'FAC-2025-112',
        description: 'Matériel chantier pipeline',
        amount: 10_000_000,
        issueDate: new Date('2025-12-15'),
        dueDate: new Date('2026-01-15'),
        status: 'NON_SOLDE',
        partnerId: partnerBeta.id,
      },
      {
        ref: 'FAC-2026-003',
        description: 'Audit final QHSE',
        amount: 1_200_000,
        issueDate: new Date('2026-01-02'),
        dueDate: new Date('2026-02-02'),
        status: 'PAYE',
        partnerId: partnerGamma.id,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Factures créées');

  // ─── MARCHÉS ─────────────────────────────────────────────────────
  const marketAlpha = await prisma.market.create({
    data: {
      partnerId: partnerAlpha.id,
      name: 'Marché principal',
      phase: 'Phase 2 — Approvisionnement',
      nextStep: 'Livraison matériaux semaine 6',
      executionRate: 45,
      nextReviewDate: new Date('2026-02-15'),
      closingDate: new Date('2026-06-30'),
    },
  });

  await prisma.market.create({
    data: {
      partnerId: partnerBeta.id,
      name: 'Contrat hydrocarbures',
      phase: 'Phase 1 — Études',
      nextStep: 'Validation rapport géotechnique',
      executionRate: 20,
      nextReviewDate: new Date('2026-03-01'),
    },
  });
  console.log('✅ Marchés créés');

  // ─── NOTES DE MARCHÉ ─────────────────────────────────────────────
  await prisma.marketNote.createMany({
    data: [
      {
        partnerId: partnerAlpha.id,
        category: 'AUDIT',
        notes: 'Audit terrain effectué : conformité aux normes sécurité validée. Quelques points à corriger sur les équipements de protection collective.',
        date: new Date('2026-01-08'),
        participants: 'Marie L., Jean D.',
      },
      {
        partnerId: partnerAlpha.id,
        category: 'COMPTE_RENDU',
        notes: 'Réunion de coordination mensuelle. Avancement confirmé à 45%. Prochaine livraison prévue semaine 6.',
        date: new Date('2026-01-12'),
        participants: 'Marie L., Jean D., Paul N.',
      },
      {
        partnerId: partnerBeta.id,
        category: 'AUDIT',
        notes: 'Revue documentaire initiale. Dossier technique incomplet — 3 pièces manquantes signalées par email.',
        date: new Date('2026-01-05'),
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Notes de marché créées');

  // ─── CONTENTIEUX ─────────────────────────────────────────────────
  await prisma.contentieux.create({
    data: {
      partnerId: partnerBeta.id,
      subject: 'Retard livraison matériel — Décembre 2025',
      description: 'Livraison prévue le 15/12/2025, effectuée le 28/12/2025. Pénalités de retard à examiner selon clause 7.3 du contrat.',
      openDate: new Date('2025-12-28'),
      status: 'EN_COURS',
    },
  });
  console.log('✅ Contentieux créé');

  // ─── CONTRAT ─────────────────────────────────────────────────────
  await prisma.contractVersion.create({
    data: {
      versionName: 'V1.0',
      fileUrl: 'https://example.com/contrats/contrat_v1.pdf',
      authorId: admin.id,
    },
  });
  console.log('✅ Contrat créé');

  // ─── CHAT MESSAGES ───────────────────────────────────────────────
  await prisma.chatMessage.createMany({
    data: [
      {
        content: 'Bonjour, pouvez-vous confirmer la date de livraison des matériaux ?',
        userId: admin.id,
        partnerId: partnerAlpha.id,
        senderType: 'admin',
        isRead: true,
      },
      {
        content: 'Bonjour, la livraison est confirmée pour le 8 février. Cordialement.',
        partnerId: partnerAlpha.id,
        senderType: 'partner',
        isRead: false,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Messages chat créés');

  console.log('\n🎉 Seed terminé !');
  console.log('─────────────────────────────────────────');
  console.log('  Connexion admin :');
  console.log('  Email    : admin@melanieservices.com');
  console.log('  Password : admin123');
  console.log('─────────────────────────────────────────');
  console.log('  Espaces partenaires (sans login) :');
  console.log('  /partner/token-alpha-001  → Société Alpha SA');
  console.log('  /partner/token-beta-002   → Entreprise Beta SARL');
  console.log('  /partner/token-gamma-003  → Construction & Co');
  console.log('─────────────────────────────────────────');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
