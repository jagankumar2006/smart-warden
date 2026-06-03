const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'jagan@2006',
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected as id ' + connection.threadId);
  connection.query('CREATE DATABASE IF NOT EXISTS smart_warden;', (err, results) => {
    if (err) console.error(err);
    else console.log('Database smart_warden checked/created.');
    connection.end();
  });
});
