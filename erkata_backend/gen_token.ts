import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET =
  process.env.SUPABASE_JWT_SECRET ||
  'E2N8cq8Hvk2CYFvq0jlxAdutt1h85yz4rlx9JbUQX7/6Y5LqlrDO9j7vYvkKO5HKnG5p2hcxOUR6Xy7eNyHfTw==';

async function main() {
  const agent = await prisma.profile.findFirst({
    where: { role: 'agent' },
  });

  if (!agent) {
    console.error('No agent found');
    return;
  }

  const payload = {
    sub: agent.id,
    email: 'agent@example.com', // Dummy email
    role: 'agent',
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  console.log(token);
}

main().finally(() => prisma.$disconnect());
