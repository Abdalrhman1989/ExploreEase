const { PaymentMethod, BillingHistory } = require('../models');
const { validationResult } = require('express-validator');

// Get all payment methods for a user
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

// Update a payment method
const updatePaymentMethod = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { cardHolder, cardNumber, expiryDate, cvv, isDefault } = req.body;
  const { id } = req.params;

  try {
    const paymentMethod = await PaymentMethod.findOne({ where: { id, userId: req.user.id } });

    if (!paymentMethod) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    await paymentMethod.update({
      cardHolder,
      cardNumber,
      expiryDate,
      cvv,
      isDefault: isDefault ?? paymentMethod.isDefault,
    });

    // Set other methods to non-default if this is set as default
    if (isDefault) {
      await PaymentMethod.update(
        { isDefault: false },
        { where: { userId: req.user.id, id: { [Op.ne]: id } } }
      );
    }

    res.status(200).json({ success: true, paymentMethod });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a payment method
const deletePaymentMethod = async (req, res) => {
  const { id } = req.params;

  try {
    const paymentMethod = await PaymentMethod.findOne({ where: { id, userId: req.user.id } });

    if (!paymentMethod) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    await paymentMethod.destroy();
    res.status(200).json({ success: true, message: 'Payment method deleted' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get billing history
const getBillingHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const billingHistory = await BillingHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, billingHistory });
  } catch (error) {
    console.error('Error fetching billing history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getBillingHistory,
};
