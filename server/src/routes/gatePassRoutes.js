const express = require('express');
const router = express.Router();
const gatePassController = require('../controllers/gatePassController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: GatePass
 *   description: Gate pass management
 */

/**
 * @swagger
 * /api/gatepass:
 *   get:
 *     summary: Get all gate passes for the logged-in user
 *     tags: [GatePass]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of gate passes
 */
router.post('/', protect, authorize('STUDENT'), upload.single('document'), gatePassController.createGatePass);
router.get('/', protect, gatePassController.getGatePasses);
router.patch('/:id/status', protect, authorize('HOD', 'WARDEN', 'SECURITY'), gatePassController.updateGatePassStatus);

module.exports = router;
