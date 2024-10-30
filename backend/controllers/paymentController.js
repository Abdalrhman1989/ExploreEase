// controllers/paymentController.js

const { PaymentMethod, BillingHistory } = require('../models');
const { validationResult } = require('express-validator');

// Get all payment methods
const getPaymentMethods = async (req, res) => {
  const userId = req.user.id;

  try {
    const paymentMethods = await PaymentMethod.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
    });

    const defaultPaymentMethod = await PaymentMethod.findOne({
      where: { userId, isDefault: true },
    });

    res.status(200).json({
      success: true,
      paymentMethods,
      defaultPaymentMethodId: defaultPaymentMethod ? defaultPaymentMethod.id : null,
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add a new payment method
const addPaymentMethod = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { cardHolder, cardNumber, expiryDate, cvv } = req.body;
  const userId = req.user.id;

  try {
    const paymentMethod = await PaymentMethod.create({
      cardHolder,
      cardNumber,
      expiryDate,
      cvv,
      userId,
    });

    res.status(201).json({ success: true, paymentMethod });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Other controller functions...

module.exports = {
  getPaymentMethods,
  addPaymentMethod,
  // Include other exports like updatePaymentMethod, deletePaymentMethod, etc.
};
