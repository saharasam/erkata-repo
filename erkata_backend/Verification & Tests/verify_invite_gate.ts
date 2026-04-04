import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000';

async function verify() {
  console.log('--- STARTING IMPROVED VERIFICATION OF INVITE GATE ---');

  const baseEmail = `test_gate_${Date.now()}`;
  
  // 1. Attempt to register as operator WITHOUT token
  const email1 = `${baseEmail}_1@example.com`;
  console.log(`\n[Case 1] Registering as operator WITHOUT token (${email1})...`);
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email1,
        fullName: 'Test Operator 1',
        password: 'password123',
        role: 'operator'
      })
    });
    
    if (res.ok) {
      const data: any = await res.json();
      if (data.debugRole === 'customer') {
        console.log(`✅ PASS: Operator registration WITHOUT token was demoted to "customer" role.`);
      } else {
        console.log(`❌ FAIL: Registered as ${data.debugRole} WITHOUT token!`);
      }
    } else {
      console.log(`✅ PASS: Registration rejected. Status: ${res.status}`);
    }
  } catch (err: any) {
    console.log(`✅ PASS: Request failed as expected: ${err.message}`);
  }

  // 2. Create a valid invite
  const email2 = `${baseEmail}_2@example.com`;
  console.log(`\n[Case 2] Creating valid invite for operator (${email2})...`);
  const superAdmin = await prisma.profile.findFirst({
    where: { role: 'super_admin' }
  });

  if (!superAdmin) {
    console.error('No Super Admin found in DB to create invite.');
    return;
  }

  const inviteToken = `token_${Date.now()}`;
  const invite = await (prisma as any).invite.create({
    data: {
      email: email2,
      role: 'operator',
      token: inviteToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      createdById: superAdmin.id
    }
  });
  console.log(`Invite created for ${email2} with token: ${inviteToken}`);

  // 3. Register WITH valid token
  console.log('\n[Case 3] Registering as operator WITH valid token...');
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email2,
        fullName: 'Test Operator 2',
        password: 'password123',
        role: 'operator',
        inviteToken: invite.token
      })
    });
    
    if (res.ok) {
      const data: any = await res.json();
      if (data.debugRole === 'operator') {
        console.log(`✅ PASS: Operator registered successfully with "operator" role.`);
      } else {
        console.log(`❌ FAIL: Registered as ${data.debugRole} despite valid token!`);
      }
    } else {
      const errorData = await res.json();
      console.log(`❌ FAIL: Registration failed with valid token: ${res.status} - ${JSON.stringify(errorData)}`);
    }
  } catch (err: any) {
    console.log(`❌ FAIL: Request failed: ${err.message}`);
  }

  // 4. Verify token is used
  const updatedInvite = await (prisma as any).invite.findUnique({
    where: { token: inviteToken }
  });
  if (updatedInvite && updatedInvite.usedAt) {
    console.log('✅ PASS: Invite marked as used.');
  } else {
    console.log('❌ FAIL: Invite NOT marked as used.');
  }

  console.log('\n--- VERIFICATION COMPLETE ---');
}

verify()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
