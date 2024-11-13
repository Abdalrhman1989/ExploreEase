// backend/controllers/paymentsController.js

const { Payment, Booking, User } = require('../models');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// Configure Nodemailer transporter (use Mailtrap for testing or another SMTP server)
const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Helper function to send emails
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: '"ExploreEase" <no-reply@exploreease.com>',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Simulate Payment (for testing)
const simulatePayment = async (req, res) => {
  const { bookingId, amount } = req.body;
  console.log('Received bookingId:', bookingId, 'and amount:', amount); 

  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  if (!bookingId || !amount) {
    return res.status(400).json({ error: 'Booking ID and amount are required.' });
  }

  try {
    const booking = await Booking.findOne({
      where: { BookingID: bookingId },
      include: [{ model: User, as: 'user' }],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({ error: 'Booking is not pending.' });
    }

    // Simulate a successful payment
    const payment = await Payment.create({
      // Providing a simulated stripePaymentIntentId
      stripePaymentIntentId: `simulated_${Date.now()}`,
      amount,
      currency: 'usd',
      status: 'Succeeded',
      paymentMethod: 'Simulated Card',
      receiptUrl: `https://fake-receipt-url.com/${booking.BookingID}`,
      userId: booking.UserID,
      BookingID: booking.BookingID,
    });

    booking.status = 'Approved';
    booking.PaymentID = payment.id;
    await booking.save();

    // Send confirmation email to user
    await sendEmail(
      booking.user.email, // Corrected access to user email
      'Booking Approved',
      `<p>Dear ${booking.user.fullName},</p>
       <p>Your booking (ID: ${booking.BookingID}) has been approved.</p>
       <p>Payment Details:</p>
       <ul>
         <li>Amount: $${(payment.amount / 100).toFixed(2)}</li>
         <li>Payment Method: ${payment.paymentMethod}</li>
         <li>Receipt: <a href="${payment.receiptUrl}" target="_blank" rel="noopener noreferrer">View Receipt</a></li>
       </ul>
       <p>Thank you for choosing ExploreEase!</p>`
    );

    res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error('Error simulating payment:', error);
    res.status(500).json({ error: 'Failed to simulate payment.' });
  }
};

module.exports = {
  simulatePayment,
};
