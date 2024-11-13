// backend/routes/payments.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const paymentsController = require('../controllers/paymentController'); // Corrected path
const authenticate = require('../middleware/authenticate');

// Simulate Payment (no Stripe)
router.post(
  '/simulate-payment',
  authenticate,
  [
    body('bookingId').isInt().withMessage('Booking ID must be an integer'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number') // Validation for amount
  ],
  paymentsController.simulatePayment
);

module.exports = router;
