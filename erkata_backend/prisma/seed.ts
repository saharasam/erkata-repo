import { PrismaClient, UserRole } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  const testUsers = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'customer@erkata.com',
      fullName: 'Demo Customer',
      role: 'customer' as UserRole,
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'agent@erkata.com',
      fullName: 'Demo Agent',
      role: 'agent' as UserRole,
      isActive: false,
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'operator@erkata.com',
      fullName: 'Demo Operator',
      role: 'operator' as UserRole,
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      email: 'admin@erkata.com',
      fullName: 'Demo Admin',
      role: 'admin' as UserRole,
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      email: 'superadmin@erkata.com',
      fullName: 'Super Admin',
      role: 'super_admin' as UserRole,
    },
  ];

  console.log('Seeding zones...');
  const zones = [
    { id: '11111111-1111-1111-1111-121111111111', name: 'Bole' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Yeka' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Arada' },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Kirkos' },
    { id: '55555555-5555-5555-5555-555555555555', name: 'Nifas Silk' },
  ];

  for (const zone of zones) {
    await prisma.zone.upsert({
      where: { id: zone.id },
      update: {},
      create: {
        id: zone.id,
        name: zone.name,
      },
    });
  }

  console.log('Seeding test users...');

  for (const user of testUsers) {
    await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        isActive: user.isActive ?? true,
      },
      create: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: '0911000000',
        isActive: user.isActive ?? true,
      },
    });
  }

  console.log('Seed completed successfully.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
