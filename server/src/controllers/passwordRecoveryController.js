const db = require('../utils/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Resend } = require('resend');
const { logAction } = require('../utils/auditLogger');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await db.execute('SELECT id, name FROM User WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      // Return 200 to prevent email enumeration
      return res.status(200).json({ message: 'If an account with that email exists, we have sent a reset link.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
    const tokenId = crypto.randomUUID();
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const expiresAtIso = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

    await db.execute(
      'INSERT INTO PasswordResetToken (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
      [tokenId, user.id, hashedToken, expiresAtIso, date]
    );

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Send response immediately so UI doesn't hang
    res.status(200).json({ message: 'If an account with that email exists, we have sent a reset link.' });

    if (process.env.RESEND_API_KEY) {
      resend.emails.send({
        from: 'Smart Warden <onboarding@resend.dev>',
        to: email,
        subject: 'Smart Warden - Password Reset Request',
        html: `
          <h1>Password Reset</h1>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset. Click the link below to reset your password. This link is valid for 30 minutes.</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>If you didn't request this, you can ignore this email.</p>
        `
      }).catch(err => {
        console.error('Failed to send email via Resend:', err);
      });
    } else {
      console.log('Skipping email send because RESEND_API_KEY is not configured.');
      console.log('Reset URL:', resetUrl);
    }

    logAction({
      actionType: 'PASSWORD_RESET_REQUESTED',
      description: `Password reset requested for ${email}`,
      userId: user.id,
      ipAddress: req.ip
    }).catch(err => {
      console.error('Failed to log action:', err);
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error during password reset request' });
    }
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [tokens] = await db.execute(
      'SELECT user_id FROM PasswordResetToken WHERE token = ? AND expires_at > ?',
      [hashedToken, now]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const userId = tokens[0].user_id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await db.execute('UPDATE User SET password = ?, updated_at = ? WHERE id = ?', [hashedPassword, updatedDate, userId]);
    
    // Delete all tokens for this user
    await db.execute('DELETE FROM PasswordResetToken WHERE user_id = ?', [userId]);

    await logAction({
      actionType: 'PASSWORD_RESET_COMPLETED',
      description: `Password reset successfully`,
      userId: userId,
      ipAddress: req.ip
    });

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};
