import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Force load .env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Using DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 20) + '...');
  
  const profiles = await prisma.profile.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      email: true,
      role: true,
      fullName: true,
      createdAt: true,
    }
  });

  console.log('Recent registrations (JSON):');
  console.log(JSON.stringify(profiles, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
