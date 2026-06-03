const db = require('../utils/db');
const crypto = require('crypto');

exports.createGatePass = async (req, res) => {
  try {
    const { reason, out_date, return_date } = req.body;
    const student_id = req.user.userId;
    const document_url = req.file ? req.file.path : null;
    const gatePassId = crypto.randomUUID();
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const outDateFormatted = new Date(out_date).toISOString().slice(0, 19).replace('T', ' ');
    const returnDateFormatted = new Date(return_date).toISOString().slice(0, 19).replace('T', ' ');

    await db.execute(
      `INSERT INTO GatePass (id, student_id, reason, document_url, status, out_date, return_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'PENDING_HOD', ?, ?, ?, ?)`,
      [gatePassId, student_id, reason, document_url, outDateFormatted, returnDateFormatted, date, date]
    );

    // Notify HOD via socket
    const io = req.app.get('io');
    if (io) {
      io.to('HOD').emit('new_gate_pass', { message: 'New gate pass request', gatePassId });
    }

    res.status(201).json({ message: 'Gate pass requested successfully', gatePassId });
  } catch (error) {
    console.error('Create gate pass error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getGatePasses = async (req, res) => {
  try {
    const { role, userId } = req.user;
    let query = `
      SELECT gp.*, u.name as student_name, u.department, u.hostel_block, u.profile_image 
      FROM GatePass gp
      JOIN User u ON gp.student_id = u.id
    `;
    let params = [];

    if (role === 'STUDENT') {
      query += ' WHERE gp.student_id = ?';
      params.push(userId);
    }
    // HOD, WARDEN, SECURITY can see all passes (in a real app, this would be filtered by department/hostel)

    query += ' ORDER BY gp.created_at DESC';

    const [rows] = await db.execute(query, params);

    // Format output to match old Prisma structure
    const gatePasses = rows.map(row => {
      const { student_name, department, hostel_block, profile_image, ...passData } = row;
      return {
        ...passData,
        student: {
          name: student_name,
          department,
          hostel_block,
          profile_image
        }
      };
    });

    res.status(200).json({ gatePasses });
  } catch (error) {
    console.error('Get gate passes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateGatePassStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    const { role } = req.user;

    const [passes] = await db.execute('SELECT * FROM GatePass WHERE id = ?', [id]);
    const gatePass = passes[0];

    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass not found' });
    }

    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let updates = ['status = ?', 'updated_at = ?'];
    let params = [status, date];

    if (status === 'REJECTED') {
      updates.push('rejection_reason = ?');
      params.push(rejection_reason || null);
    }

    if (role === 'HOD' && status === 'PENDING_WARDEN') {
      updates.push('hod_approved_at = ?');
      params.push(date);
    } else if (role === 'WARDEN' && status === 'APPROVED') {
      updates.push('warden_approved_at = ?');
      params.push(date);
      updates.push('qr_token = ?');
      params.push(crypto.randomBytes(16).toString('hex'));
    }

    params.push(id); // for WHERE clause

    await db.execute(
      `UPDATE GatePass SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Notify user
    const io = req.app.get('io');
    if (io) {
      io.to(gatePass.student_id).emit('gate_pass_update', { message: `Your gate pass is now ${status}`, status });
      if (status === 'PENDING_WARDEN') {
        io.to('WARDEN').emit('new_gate_pass', { message: 'New gate pass request pending warden approval' });
      }
    }

    res.status(200).json({ message: `Gate pass updated to ${status}` });
  } catch (error) {
    console.error('Update gate pass status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
