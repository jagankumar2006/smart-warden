const db = require('./db');
const crypto = require('crypto');

/**
 * Creates a notification in the database and emits it via Socket.io
 */
const notifyUser = async (io, userId, title, message) => {
  try {
    const id = crypto.randomUUID();
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.execute(
      'INSERT INTO Notification (id, user_id, title, message, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, userId, title, message, date]
    );

    if (io) {
      io.to(userId).emit('notification', { id, title, message, is_read: false, created_at: date });
    }
  } catch (error) {
    console.error('Error sending notification to user:', error);
  }
};

/**
 * Creates a notification for all users with a specific role
 */
const notifyRole = async (io, role, title, message) => {
  try {
    const [users] = await db.execute('SELECT id FROM User WHERE role = ?', [role]);
    
    for (const user of users) {
      const id = crypto.randomUUID();
      const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await db.execute(
        'INSERT INTO Notification (id, user_id, title, message, created_at) VALUES (?, ?, ?, ?, ?)',
        [id, user.id, title, message, date]
      );
    }

    if (io) {
      io.to(role).emit('notification', { title, message, is_read: false });
    }
  } catch (error) {
    console.error('Error sending notification to role:', error);
  }
};

module.exports = {
  notifyUser,
  notifyRole
};
