const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validate');
const authValidation = require('../validations/auth.validation');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User management and authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [STUDENT, HOD, WARDEN, SECURITY]
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', validate(authValidation.register), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validate(authValidation.login), authController.login);

router.get('/me', protect, authController.getMe);
router.put('/password', protect, validate(authValidation.updatePassword), authController.updatePassword);
router.put('/profile', protect, validate(authValidation.updateProfile), authController.updateProfile);
router.put('/profile-picture', protect, upload.single('profile_image'), authController.updateProfilePicture);
router.get('/notifications', protect, authController.getNotifications);
router.patch('/notifications/:id/read', protect, authController.markNotificationRead);

module.exports = router;
