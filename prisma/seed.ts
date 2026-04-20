import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log('Admin déjà existant — seed ignoré.');
    return;
  }

  const hashed = await bcrypt.hash('Admin@MSP2026!', 12);

  const user = await prisma.user.create({
    data: {
      name:     'Administrateur MSP',
      email:    'admin@melanieservices.com',
      password: hashed,
      phone:    '+242 06 XXX XX XX',
    },
  });

  console.log(`✓ Admin créé : ${user.email}`);
  console.log('  Mot de passe par défaut : Admin@MSP2026!');
  console.log('  ⚠ Changez ce mot de passe dès la 1ère connexion !');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
