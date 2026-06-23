const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/users', adminController.getUsers);
router.patch('/users/:id', adminController.updateUser);
router.get('/stats', adminController.getStats);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/analytics', adminController.getAdvancedAnalytics);

router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.createDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

router.get('/hostels', adminController.getHostelBlocks);
router.post('/hostels', adminController.createHostelBlock);
router.delete('/hostels/:id', adminController.deleteHostelBlock);

module.exports = router;
