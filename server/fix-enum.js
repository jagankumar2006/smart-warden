require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixEnum() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('Connected to Railway Database!');
    
    // Modify the Status ENUM to include EXITED and RETURNED
    await connection.execute(`
      ALTER TABLE GatePass 
      MODIFY COLUMN status ENUM('PENDING_HOD', 'PENDING_WARDEN', 'APPROVED', 'REJECTED', 'EXITED', 'RETURNED') NOT NULL DEFAULT 'PENDING_HOD'
    `);
    
    console.log('✅ Successfully added EXITED and RETURNED to the Status Enum on Railway!');
    connection.end();
  } catch (err) {
    console.error('❌ Error modifying table:', err);
  }
}

fixEnum();
