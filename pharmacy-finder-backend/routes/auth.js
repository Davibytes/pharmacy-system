const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public Routes
router.post('/customer/signup', authController.customerSignup);
router.post('/customer/login', authController.customerLogin);
router.post('/customer/forgot-password', authController.requestCustomerPasswordReset);
router.post('/customer/password-reset/request', authController.requestCustomerPasswordReset);
router.post('/customer/reset-password', authController.resetCustomerPassword);
router.post('/customer/reset-password/:resetToken', authController.resetCustomerPasswordWithToken);
router.post('/pharmacy/signup', authController.pharmacySignup);
router.post('/pharmacy/login', authController.pharmacyLogin);
router.post('/pharmacy/forgot-password', authController.requestPharmacyPasswordReset);
router.post('/pharmacy/reset-password/:resetToken', authController.resetPharmacyPassword);

// Protected Routes
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
