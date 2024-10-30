const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');

// Apply authentication middleware to all payment routes
router.use(authenticate);

// Get all payment methods
router.get('/methods', paymentController.getPaymentMethods);

// Add a new payment method
router.post(
  '/methods',
  [
    body('cardHolder').notEmpty().withMessage('Card holder name is required'),
    body('cardNumber').matches(/^[0-9]{16}$/).withMessage('Card number must be 16 digits'),
    body('expiryDate').matches(/^(0[1-9]|1[0-2])\/[0-9]{2}$/).withMessage('Expiry date must be in MM/YY format'),
    body('cvv').matches(/^[0-9]{3,4}$/).withMessage('CVV must be 3 or 4 digits'),
  ],
  paymentController.addPaymentMethod
);

// Other routes...
module.exports = router;
