const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/users', adminController.getUsers);
router.patch('/users/:id', adminController.updateUser);
router.get('/stats', adminController.getStats);

module.exports = router;
