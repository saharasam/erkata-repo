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

  console.log('Seeding system configuration...');
  await prisma.systemConfig.upsert({
    where: { key: 'AGLP_TO_ETB_RATE' },
    update: {},
    create: {
      key: 'AGLP_TO_ETB_RATE',
      value: { rate: 1.0 },
      description:
        'Exchange rate from ETB to AGLP (Primary Platform Currency).',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'AGLP_COMMISSION_PACKAGE_REFERRAL' },
    update: {},
    create: {
      key: 'AGLP_COMMISSION_PACKAGE_REFERRAL',
      value: { value: 0.1 },
      description: 'Referral commission for package upgrades.',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'COMMISSION_REAL_ESTATE_PRIMARY' },
    update: {},
    create: {
      key: 'COMMISSION_REAL_ESTATE_PRIMARY',
      value: { value: 0.1 },
      description: 'Commission for primary agent on real estate fulfillment.',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'COMMISSION_REAL_ESTATE_OVERRIDE' },
    update: {},
    create: {
      key: 'COMMISSION_REAL_ESTATE_OVERRIDE',
      value: { value: 0.05 },
      description: 'Referral override commission on real estate fulfillment.',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'COMMISSION_FURNITURE_PRIMARY' },
    update: {},
    create: {
      key: 'COMMISSION_FURNITURE_PRIMARY',
      value: { value: 0.1 },
      description: 'Commission for primary agent on furniture fulfillment.',
    },
  });
 
  await prisma.systemConfig.upsert({
    where: { key: 'alert_commission_spike_threshold' },
    update: {},
    create: {
      key: 'alert_commission_spike_threshold',
      value: { value: 10000 },
      description:
        'Threshold for suspicious commission earnings in a rolling 24h window.',
    },
  });

  console.log('Seeding test users...');

  for (const user of testUsers) {
    await prisma.profile.upsert({
      where: { email: user.email },
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

  console.log('Seeding packages...');
  const packages = [
    {
      name: 'FREE',
      displayName: 'Free',
      price: 0,
      referralSlots: 3,
      zoneLimit: 1,
      description: 'Standard access for newly onboarded agents.',
    },
    {
      name: 'PEACE',
      displayName: 'Peace',
      price: 2500,
      referralSlots: 7,
      zoneLimit: 2,
      description: 'For agents building their first local footprint.',
    },
    {
      name: 'LOVE',
      displayName: 'Love',
      price: 5000,
      referralSlots: 16,
      zoneLimit: 3,
      description: 'Grow your network and reach more lucrative territories.',
    },
    {
      name: 'UNITY',
      displayName: 'Unity',
      price: 10000,
      referralSlots: 23,
      zoneLimit: 5,
      description: 'For professionals managing active regional pipelines.',
    },
    {
      name: 'ABUNDANT_LIFE',
      displayName: 'Abundant Life',
      price: 25000,
      referralSlots: 31,
      zoneLimit: 100,
      description: 'Unrestricted reach and maximum team growth potential.',
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      // @ts-expect-error - Tier is an enum in Prisma, string name is expected to work but type-checked strictly
      where: { name: pkg.name },
      update: {
        displayName: pkg.displayName,
        price: pkg.price,
        referralSlots: pkg.referralSlots,
        zoneLimit: pkg.zoneLimit,
        description: pkg.description,
      },
      create: {
        // @ts-expect-error - Tier is an enum in Prisma
        name: pkg.name,
        displayName: pkg.displayName,
        price: pkg.price,
        referralSlots: pkg.referralSlots,
        zoneLimit: pkg.zoneLimit,
        description: pkg.description,
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
