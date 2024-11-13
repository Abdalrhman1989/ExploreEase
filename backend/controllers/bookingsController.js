// backend/controllers/bookingsController.js

const { Booking, Hotel, User, Payment } = require('../models');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer'); // For sending emails
require('dotenv').config(); // Ensure environment variables are loaded

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io', // Replace with your SMTP server
  port: 2525,
  auth: {
    user: process.env.MAIL_USER, // Set in your .env
    pass: process.env.MAIL_PASS, // Set in your .env
  },
});

// Helper function to send emails
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: '"ExploreEase" <no-reply@exploreease.com>', // Replace with your sender address
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Helper function to calculate booking amount
const calculateBookingAmount = (booking) => {
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const timeDiff = checkOutDate - checkInDate;
  const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Example room prices
  const roomPrices = {
    'Single': 100,
    'Double': 150,
    'Suite': 200,
  };

  const pricePerNight = roomPrices[booking.roomType] || 100;
  return numberOfNights * pricePerNight;
};

// Create a new booking
const createBooking = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const {
    fullName,
    email,
    phone,
    checkIn,
    checkOut,
    guests,
    hotelId,
  } = req.body;

  try {
    // Fetch user from the database using FirebaseUID
    const user = await User.findOne({ where: { FirebaseUID: req.user.uid } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const userId = user.UserID;

    // Validate check-in and check-out dates
    if (new Date(checkOut) <= new Date(checkIn)) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date.' });
    }

    // Optionally, check room availability here

    const booking = await Booking.create({
      UserID: userId, // Use the retrieved UserID
      HotelID: hotelId,
      fullName,
      email,
      phone,
      checkIn,
      checkOut,
      guests,
      status: 'Pending', // Initial status
    });

    console.log('Booking created:', booking);

    // Optionally, send a confirmation email to the user
    /*
    const user = await User.findByPk(userId);
    if (user) {
      await sendEmail(
        user.Email,
        'Booking Received',
        `<p>Dear ${user.UserName},</p>
         <p>We have received your booking request for a ${booking.roomType} room at Hotel ID ${hotelId} from ${checkIn} to ${checkOut}.</p>
         <p>Your booking is currently pending approval.</p>
         <p>Thank you for choosing ExploreEase!</p>`
      );
    }
    */

    // Respond with the booking details, including BookingID
    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all bookings (Admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'user', attributes: ['UserID', 'UserName', 'Email'] },
        { model: Hotel, as: 'hotel', attributes: ['HotelID', 'name'] },
        { model: Payment, as: 'payment' },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a single booking by ID
const getBookingById = async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.userData.UserID;
  const userRole = req.userData.UserType;

  try {
    const booking = await Booking.findOne({
      where: { BookingID: bookingId },
      include: [
        { model: User, as: 'user', attributes: ['UserID', 'UserName', 'Email'] },
        { model: Hotel, as: 'hotel', attributes: ['HotelID', 'name'] },
        { model: Payment, as: 'payment' },
      ],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Allow access if admin or the user who made the booking
    if (userRole !== 'Admin' && booking.UserID !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update a booking
const updateBooking = async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.userData.UserID;
  const isAdmin = req.userData.UserType === 'Admin';
  const { status } = req.body;

  try {
    const booking = await Booking.findOne({
      where: { BookingID: bookingId },
      include: [
        { model: User, as: 'user', attributes: ['UserID', 'UserName', 'Email'] },
        { model: Hotel, as: 'hotel', attributes: ['HotelID', 'name'] },
        { model: Payment, as: 'payment' },
      ],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (isAdmin) {
      // Admin can update status and other details
      if (status && ['Approved', 'Rejected', 'Cancelled'].includes(status)) {
        booking.status = status;

        // Simulate fake payment upon approval
        if (status === 'Approved' && !booking.payment) {
          const amount = calculateBookingAmount(booking);
          const payment = await Payment.create({
            stripePaymentIntentId: `fake_pi_${Date.now()}`,
            amount: amount * 100, // Convert to cents
            currency: 'USD',
            status: 'Succeeded',
            paymentMethod: 'Fake Card',
            receiptUrl: `https://fake-receipt-url.com/${booking.BookingID}`,
            userId: booking.UserID,
            BookingID: booking.BookingID,
          });

          // Associate payment with booking
          booking.PaymentID = payment.id;

          // Send an approval email to the user
          const user = await User.findByPk(booking.UserID);
          if (user) {
            await sendEmail(
              user.Email,
              'Booking Approved',
              `<p>Dear ${user.UserName},</p>
               <p>Your booking (ID: ${booking.BookingID}) for a ${booking.roomType} room at ${booking.hotel.name} from ${booking.checkIn} to ${booking.checkOut} has been approved.</p>
               <p>Payment Details:</p>
               <ul>
                 <li>Amount: $${(payment.amount / 100).toFixed(2)}</li>
                 <li>Payment Method: ${payment.paymentMethod}</li>
                 <li>Receipt: <a href="${payment.receiptUrl}" target="_blank" rel="noopener noreferrer">View Receipt</a></li>
               </ul>
               <p>Thank you for choosing ExploreEase!</p>`
            );
          }
        }
      }

      await booking.save();

      res.status(200).json({ success: true, booking });
    } else {
      // Users can update their own booking details only if it's still pending
      if (booking.UserID !== userId) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      if (booking.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Cannot edit booking that is not pending.' });
      }

      // Update allowed fields
      // Add other fields as needed
      await booking.save();

      res.status(200).json({ success: true, booking });
    }
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a booking
const deleteBooking = async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.userData.UserID;
  const isAdmin = req.userData.UserType === 'Admin';

  try {
    const booking = await Booking.findOne({ where: { BookingID: bookingId } });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Allow deletion if admin or the user who made the booking
    if (!isAdmin && booking.UserID !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await booking.destroy();

    res.status(200).json({ success: true, message: 'Booking deleted successfully.' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
