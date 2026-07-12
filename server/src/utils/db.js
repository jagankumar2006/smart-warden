const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Auto-retry wrapper for connection lost errors
const withRetry = (method) => {
  return async (...args) => {
    try {
      return await method(...args);
    } catch (error) {
      if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNRESET') {
        console.warn('Database connection lost, retrying query...');
        return await method(...args);
      }
      throw error;
    }
  };
};

pool.execute = withRetry(pool.execute.bind(pool));
pool.query = withRetry(pool.query.bind(pool));

module.exports = pool;
