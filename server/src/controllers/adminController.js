const db = require('../utils/db');
const { logAction } = require('../utils/auditLogger');
const crypto = require('crypto');
// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, name, email, role, department, hostel_block as block FROM User ORDER BY created_at DESC');
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// @desc    Update a user's role/details (Admin only)
// @route   PATCH /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department, block } = req.body;

    const [existing] = await db.execute('SELECT id FROM User WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = [];
    const params = [];

    if (role) {
      updates.push('role = ?');
      params.push(role);
    }
    if (department !== undefined) {
      updates.push('department = ?');
      params.push(department || null);
    }
    if (block !== undefined) {
      updates.push('hostel_block = ?');
      params.push(block || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    params.push(id);
    await db.execute(`UPDATE User SET ${updates.join(', ')} WHERE id = ?`, params);

    if (role) {
      await logAction({
        actionType: 'USER_ROLE_CHANGED',
        description: `Admin changed user ${id} role to ${role}`,
        userId: req.user.userId,
        userRole: 'ADMIN',
        ipAddress: req.ip
      });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

// @desc    Get system stats (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const [userStats] = await db.execute('SELECT role, COUNT(*) as count FROM User GROUP BY role');
    const [passStats] = await db.execute('SELECT status, COUNT(*) as count FROM GatePass GROUP BY status');
    
    // Transform arrays into key-value objects for easy consumption
    const users = userStats.reduce((acc, curr) => ({ ...acc, [curr.role]: curr.count }), {});
    const passes = passStats.reduce((acc, curr) => ({ ...acc, [curr.status]: curr.count }), {});

    res.json({ stats: { users, passes } });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const [logs] = await db.execute('SELECT * FROM AuditLog ORDER BY timestamp DESC LIMIT 500');
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching audit logs' });
  }
};

const getAdvancedAnalytics = async (req, res) => {
  try {
    // Basic aggregation for Recharts
    const [dailyRequests] = await db.execute(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM GatePass 
      GROUP BY DATE(created_at) 
      ORDER BY date DESC LIMIT 30
    `);
    res.json({ dailyRequests });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

// Departments
const getDepartments = async (req, res) => {
  try {
    const [departments] = await db.execute('SELECT * FROM Department ORDER BY created_at DESC');
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching departments' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const id = crypto.randomUUID();
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.execute('INSERT INTO Department (id, name, created_at) VALUES (?, ?, ?)', [id, name, date]);
    res.status(201).json({ message: 'Department created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating department' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await db.execute('DELETE FROM Department WHERE id = ?', [req.params.id]);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting department' });
  }
};

// Hostel Blocks
const getHostelBlocks = async (req, res) => {
  try {
    const [blocks] = await db.execute('SELECT * FROM HostelBlock ORDER BY created_at DESC');
    res.json({ blocks });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching hostel blocks' });
  }
};

const createHostelBlock = async (req, res) => {
  try {
    const { name } = req.body;
    const id = crypto.randomUUID();
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.execute('INSERT INTO HostelBlock (id, name, created_at) VALUES (?, ?, ?)', [id, name, date]);
    res.status(201).json({ message: 'Hostel block created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating hostel block' });
  }
};

const deleteHostelBlock = async (req, res) => {
  try {
    await db.execute('DELETE FROM HostelBlock WHERE id = ?', [req.params.id]);
    res.json({ message: 'Hostel block deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting hostel block' });
  }
};

module.exports = {
  getUsers,
  updateUser,
  getStats,
  getAuditLogs,
  getAdvancedAnalytics,
  getDepartments,
  createDepartment,
  deleteDepartment,
  getHostelBlocks,
  createHostelBlock,
  deleteHostelBlock
};
