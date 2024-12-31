const { Payment, Booking, FlightBooking, User, Hotel } = require('../models');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
require('dotenv').config(); 

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
  const { bookingId, bookingType, amount } = req.body;
  console.log('Received bookingId:', bookingId, 'bookingType:', bookingType, 'and amount:', amount); 

  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  if (!bookingId || !amount || !bookingType) {
    return res.status(400).json({ error: 'Booking ID, booking type, and amount are required.' });
  }

  try {
    let booking, userEmail, userFullName, paymentDetails = {};

    if (bookingType === 'hotel') {
      // Handle Hotel Booking
      booking = await Booking.findOne({
        where: { BookingID: bookingId },
        include: [{ model: User, as: 'user' }, { model: Hotel, as: 'hotel' }],
      });

      if (!booking) {
        return res.status(404).json({ error: 'Hotel booking not found.' });
      }

      if (booking.status !== 'Pending') {
        return res.status(400).json({ error: 'Hotel booking is not pending.' });
      }

      userEmail = booking.user.email;
      userFullName = `${booking.user.firstName} ${booking.user.lastName}`;

      // Prepare payment details specific to hotel booking
      paymentDetails = {
        stripePaymentIntentId: `simulated_${Date.now()}`,
        amount,
        currency: 'usd',
        status: 'Succeeded',
        paymentMethod: 'Simulated Card',
        receiptUrl: `https://fake-receipt-url.com/${booking.BookingID}`,
        userId: booking.UserID,
        BookingID: booking.BookingID,
        FlightBookingID: null, // Explicitly set to null
      };
    } else if (bookingType === 'flight') {
      // Handle Flight Booking
      booking = await FlightBooking.findOne({
        where: { FlightBookingID: bookingId },
        include: [{ model: User, as: 'user' }],
      });

      if (!booking) {
        return res.status(404).json({ error: 'Flight booking not found.' });
      }

      if (booking.status !== 'Pending') {
        return res.status(400).json({ error: 'Flight booking is not pending.' });
      }

      userEmail = booking.user.email;
      userFullName = `${booking.user.firstName} ${booking.user.lastName}`;

      // Prepare payment details specific to flight booking
      paymentDetails = {
        stripePaymentIntentId: `simulated_${Date.now()}`,
        amount,
        currency: 'usd',
        status: 'Succeeded',
        paymentMethod: 'Simulated Card',
        receiptUrl: `https://fake-receipt-url.com/${booking.FlightBookingID}`,
        userId: booking.UserID,
        BookingID: null, // Explicitly set to null
        FlightBookingID: booking.FlightBookingID,
      };
    } else {
      return res.status(400).json({ error: 'Invalid booking type. Must be "hotel" or "flight".' });
    }

    // Simulate a successful payment
    const payment = await Payment.create(paymentDetails);

    // Associate payment with the booking
    if (bookingType === 'hotel') {
      booking.PaymentID = payment.id;
      await booking.save();
    } else if (bookingType === 'flight') {
      booking.PaymentID = payment.id;
      await booking.save();
    }

    // Send confirmation email to user about payment received
    if (bookingType === 'hotel') {
      await sendEmail(
        userEmail,
        'Payment Received - Booking Pending Approval',
        `<p>Dear ${userFullName},</p>
         <p>We have received your payment for booking (ID: ${booking.BookingID}) for a <strong>${booking.roomType}</strong> room at <strong>${booking.hotel.name}</strong> from <strong>${new Date(booking.checkIn).toLocaleDateString()}</strong> to <strong>${new Date(booking.checkOut).toLocaleDateString()}</strong>.</p>
         <p>Your booking is currently pending approval. You will receive a confirmation email once the booking is approved.</p>
         <p>Thank you for choosing ExploreEase!</p>`
      );
    } else if (bookingType === 'flight') {
      await sendEmail(
        userEmail,
        'Payment Received - Booking Confirmed',
        `<p>Dear ${userFullName},</p>
         <p>Your payment for flight booking (ID: ${booking.FlightBookingID}) has been received and your booking is confirmed.</p>
         <p>Thank you for choosing ExploreEase!</p>`
      );
    }

    // Optionally, notify admin about the payment
    if (process.env.ADMIN_EMAIL) {
      await sendEmail(
        process.env.ADMIN_EMAIL,
        'New Payment Received',
        bookingType === 'hotel'
          ? `<p>A new payment has been received for a hotel booking:</p>
             <p><strong>Booking ID:</strong> ${booking.BookingID}</p>
             <p><strong>User:</strong> ${booking.user.UserName} (${booking.user.Email})</p>
             <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
             <p><strong>Payment Method:</strong> Simulated Card</p>`
          : `<p>A new payment has been received for a flight booking:</p>
             <p><strong>Flight Booking ID:</strong> ${booking.FlightBookingID}</p>
             <p><strong>User:</strong> ${booking.user.UserName} (${booking.user.Email})</p>
             <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
             <p><strong>Payment Method:</strong> Simulated Card</p>`
      );
    }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error('Error simulating payment:', error);
    res.status(500).json({ error: 'Failed to simulate payment.' });
  }
};

module.exports = {
  simulatePayment,
};
