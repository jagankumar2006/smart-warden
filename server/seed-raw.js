const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

require('dotenv').config();

async function seed() {
  console.log('Seeding via raw SQL...');
  try {
    const connection = await mysql.createConnection(process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL);
    
    const passwordHash = bcrypt.hashSync('password123', 10);
    const date = new Date().toISOString().slice(0, 19).replace('T', ' '); // format: YYYY-MM-DD HH:MM:SS

    // Clean existing users first if any
    await connection.execute('DELETE FROM User');

    // Generate unique UUIDs
    const crypto = require('crypto');
    const u1 = crypto.randomUUID();
    const u2 = crypto.randomUUID();
    const u3 = crypto.randomUUID();

    // 1. Student
    await connection.execute(
      `INSERT INTO User (id, email, name, password, role, department, hostel_block, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u1, 'student@smartwarden.com', 'John Doe', passwordHash, 'STUDENT', 'Computer Science', 'A Block', date, date]
    );
    console.log('Created Student: student@smartwarden.com');

    // 2. HOD
    await connection.execute(
      `INSERT INTO User (id, email, name, password, role, department, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [u2, 'hod@smartwarden.com', 'Dr. Alan Smith', passwordHash, 'HOD', 'Computer Science', date, date]
    );
    console.log('Created HOD: hod@smartwarden.com');

    // 3. Warden
    await connection.execute(
      `INSERT INTO User (id, email, name, password, role, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [u3, 'warden@smartwarden.com', 'Mr. Robert Johnson', passwordHash, 'WARDEN', date, date]
    );
    console.log('Created Warden: warden@smartwarden.com');

    await connection.end();
    console.log('Seeding finished successfully.');
  } catch (err) {
    console.error('Error seeding:', err);
  }
}

seed();
