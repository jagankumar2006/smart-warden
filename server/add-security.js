const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

require('dotenv').config();

async function addSecurityGuard() {
  try {
    const connection = await mysql.createConnection(process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL);
    const passwordHash = bcrypt.hashSync('password123', 10);
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await connection.execute(
      `INSERT IGNORE INTO User (id, email, name, password, role, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), 'security@smartwarden.com', 'Mr. Guard', passwordHash, 'SECURITY', date, date]
    );

    console.log('Created Security Guard: security@smartwarden.com');
    await connection.end();
  } catch (err) {
    console.error('Error:', err);
  }
}
addSecurityGuard();
