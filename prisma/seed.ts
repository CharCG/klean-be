import bcrypt from 'bcrypt';
import { prisma } from '../src/config/prisma.config';

async function main() {
  const hashedPassword = await bcrypt.hash('!AdminKlean123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@klean.com' },
    update: {},
    create: {
      email: 'admin@klean.com',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Admin',
      phone: '',
      address: '',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
