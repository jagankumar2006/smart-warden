require('dotenv').config();
const mysql = require('mysql2/promise');

async function makeAdmin() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('Connected to Railway Database!');
    
    // Set jagankumar0550@gmail.com to ADMIN
    const [result] = await connection.execute(
      `UPDATE User SET role = 'ADMIN' WHERE email = 'jagankumar0550@gmail.com'`
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Successfully promoted jagankumar0550@gmail.com to ADMIN!');
    } else {
      console.log('⚠️ Could not find user with that email. Make sure you registered with it.');
    }

    connection.end();
  } catch (err) {
    console.error('❌ Error modifying table:', err);
  }
}

makeAdmin();
