const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create a Student
  const student = await prisma.user.upsert({
    where: { email: 'student@smartwarden.com' },
    update: {},
    create: {
      email: 'student@smartwarden.com',
      name: 'John Doe',
      password: passwordHash,
      role: 'STUDENT',
      department: 'Computer Science',
      hostel_block: 'A Block'
    }
  });
  console.log('Created Student:', student.email);

  // 2. Create an HOD
  const hod = await prisma.user.upsert({
    where: { email: 'hod@smartwarden.com' },
    update: {},
    create: {
      email: 'hod@smartwarden.com',
      name: 'Dr. Alan Smith',
      password: passwordHash,
      role: 'HOD',
      department: 'Computer Science'
    }
  });
  console.log('Created HOD:', hod.email);

  // 3. Create a Chief Warden
  const warden = await prisma.user.upsert({
    where: { email: 'warden@smartwarden.com' },
    update: {},
    create: {
      email: 'warden@smartwarden.com',
      name: 'Mr. Robert Johnson',
      password: passwordHash,
      role: 'WARDEN'
    }
  });
  console.log('Created Chief Warden:', warden.email);

  console.log('\nSeeding finished.');
  console.log('\nYou can now log in with any of these accounts using password: password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
