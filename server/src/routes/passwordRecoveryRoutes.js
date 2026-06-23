const express = require('express');
const router = express.Router();
const passwordRecoveryController = require('../controllers/passwordRecoveryController');

router.post('/forgot-password', passwordRecoveryController.requestPasswordReset);
router.post('/reset-password/:token', passwordRecoveryController.resetPassword);

module.exports = router;
