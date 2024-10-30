// services/stripeService.js

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Ensure this key is set in your .env file

/**
 * Creates a Payment Intent with Stripe.
 * @param {number} amount - The amount in cents.
 * @param {string} currency - The currency code (e.g., 'usd').
 * @returns {Promise<object>} - The created Payment Intent.
 */
const createPaymentIntent = async (amount, currency = 'usd') => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    return paymentIntent;
  } catch (error) {
    console.error('Stripe createPaymentIntent Error:', error);
    throw new Error('Failed to create payment intent.');
  }
};

/**
 * Retrieves a Payment Intent by ID.
 * @param {string} paymentIntentId - The ID of the Payment Intent.
 * @returns {Promise<object>} - The retrieved Payment Intent.
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe retrievePaymentIntent Error:', error);
    throw new Error('Failed to retrieve payment intent.');
  }
};

module.exports = {
  createPaymentIntent,
  retrievePaymentIntent,
};
