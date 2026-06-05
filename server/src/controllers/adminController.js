const db = require('../utils/db');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, name, email, role, department, year, hostler, block FROM User ORDER BY created_at DESC');
    res.json({ users });
  } catch (error) {
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
      updates.push('block = ?');
      params.push(block || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    params.push(id);
    await db.execute(`UPDATE User SET ${updates.join(', ')} WHERE id = ?`, params);

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

module.exports = {
  getUsers,
  updateUser,
  getStats
};
