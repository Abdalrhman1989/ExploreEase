// backend/controllers/flightBookingsController.js

const { FlightBooking, User, Payment } = require('../models');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if essential environment variables are present
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Error: Missing EMAIL_USER or EMAIL_PASS in environment variables.');
  process.exit(1); // Exit the application if SMTP config is missing
}

// Configure Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 587, // Use 587 for STARTTLS
  secure: false, // Upgrade later with STARTTLS
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
  },
});

// Verify transporter configuration
transporter.verify()
  .then(() => console.log('Nodemailer transporter is ready'))
  .catch((error) => console.error('Nodemailer transporter error:', error));

// Helper function to send emails
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"ExploreEase" <${process.env.EMAIL_USER}>`, // Sender address
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

// Create a new flight booking
const createFlightBooking = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    departureTime,
    arrivalTime,
    flightNumber,
    departureAirport,
    arrivalAirport,
    seatClass,
    price,
    dateOfBirth,
    passportNumber,
    issuanceDate,
    expiryDate,
    issuanceCountry,
    nationality,
  } = req.body;

  try {
    // Fetch user from the database using UserID from req.userData
    const user = await User.findOne({ where: { UserID: req.userData.UserID } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const userId = user.UserID;

    // Validate dates
    if (new Date(arrivalTime) <= new Date(departureTime)) {
      return res.status(400).json({ success: false, message: 'Arrival time must be after departure time.' });
    }

    // Optionally, check flight seat availability here
    // Example:
    // const isAvailable = await checkSeatAvailability(flightNumber, departureAirport, arrivalAirport, departureTime, seatClass);
    // if (!isAvailable) {
    //   return res.status(400).json({ success: false, message: 'Selected seat is not available for the chosen flight.' });
    // }

    // Create the flight booking with status 'Pending'
    const flightBooking = await FlightBooking.create({
      UserID: userId,
      flightNumber,
      departureAirport,
      arrivalAirport,
      departureTime,
      arrivalTime,
      seatClass,
      price,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      passportNumber,
      issuanceDate,
      expiryDate,
      issuanceCountry,
      nationality,
      status: 'Pending',
    });

    console.log('Flight Booking created:', flightBooking);

    // Send a notification email to the user about the booking creation
    await sendEmail(
      user.Email,
      'Flight Booking Received',
      `<p>Dear ${user.UserName},</p>
       <p>We have received your flight booking request:</p>
       <p><strong>Flight Number:</strong> ${flightBooking.flightNumber}</p>
       <p><strong>From:</strong> ${flightBooking.departureAirport} at ${new Date(flightBooking.departureTime).toLocaleString()}</p>
       <p><strong>To:</strong> ${flightBooking.arrivalAirport} at ${new Date(flightBooking.arrivalTime).toLocaleString()}</p>
       <p><strong>Seat Class:</strong> ${flightBooking.seatClass}</p>
       <p><strong>Price:</strong> ${flightBooking.price}</p>
       <p>Your booking is currently pending approval. You will receive a confirmation email once the booking is approved.</p>
       <p>Thank you for choosing ExploreEase!</p>`
    );

    // Send a notification email to the admin
    if (process.env.ADMIN_EMAIL) {
      await sendEmail(
        process.env.ADMIN_EMAIL,
        'New Flight Booking Received',
        `<p>A new flight booking has been received:</p>
         <p><strong>Flight Booking ID:</strong> ${flightBooking.FlightBookingID}</p>
         <p><strong>User:</strong> ${user.UserName} (${user.Email})</p>
         <p><strong>Flight Number:</strong> ${flightBooking.flightNumber}</p>
         <p><strong>From:</strong> ${flightBooking.departureAirport} at ${new Date(flightBooking.departureTime).toLocaleString()}</p>
         <p><strong>To:</strong> ${flightBooking.arrivalAirport} at ${new Date(flightBooking.arrivalTime).toLocaleString()}</p>
         <p><strong>Seat Class:</strong> ${flightBooking.seatClass}</p>
         <p><strong>Price:</strong> ${flightBooking.price}</p>
         <p><strong>Passengers:</strong> ${flightBooking.firstName} ${flightBooking.lastName}</p>`
      );
    }

    // Respond with the flight booking details
    res.status(201).json({ success: true, flightBooking });
  } catch (error) {
    console.error('Error creating flight booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all flight bookings (Admin)
const getAllFlightBookings = async (req, res) => {
  try {
    const flightBookings = await FlightBooking.findAll({
      include: [
        { model: User, as: 'user', attributes: ['UserID', 'UserName', 'Email'] },
        { model: Payment, as: 'payment' },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, flightBookings });
  } catch (error) {
    console.error('Error fetching flight bookings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a single flight booking by ID
const getFlightBookingById = async (req, res) => {
  const flightBookingId = req.params.id;
  const userId = req.userData.UserID;
  const userRole = req.userData.UserType;

  try {
    const flightBooking = await FlightBooking.findOne({
      where: { FlightBookingID: flightBookingId },
      include: [
        { model: User, as: 'user', attributes: ['UserID', 'UserName', 'Email'] },
        { model: Payment, as: 'payment' },
      ],
    });

    if (!flightBooking) {
      return res.status(404).json({ success: false, message: 'Flight booking not found.' });
    }

    // Allow access if admin or the user who made the booking
    if (userRole !== 'Admin' && flightBooking.UserID !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, flightBooking });
  } catch (error) {
    console.error('Error fetching flight booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update a flight booking
const updateFlightBooking = async (req, res) => {
  const flightBookingId = req.params.id;
  const userId = req.userData.UserID;
  const userRole = req.userData.UserType; // ensure userData has UserType
  const { status, flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, seatClass, price } = req.body;

  try {
    const flightBooking = await FlightBooking.findOne({
      where: { FlightBookingID: flightBookingId },
      include: [
        { model: User, as: 'user', attributes: ['UserID', 'UserName', 'Email'] },
        { model: Payment, as: 'payment' },
      ],
    });

    if (!flightBooking) {
      return res.status(404).json({ success: false, message: 'Flight booking not found.' });
    }

    if (userRole === 'Admin') {
      // Admin can update status and other details
      if (status && ['Approved', 'Rejected', 'Cancelled'].includes(status)) {
        flightBooking.status = status;

        if (status === 'Approved') {
          // Send approval email to user
          await sendEmail(
            flightBooking.user.Email,
            'Flight Booking Approved',
            `<p>Dear ${flightBooking.user.UserName},</p>
             <p>Your flight booking (ID: ${flightBooking.FlightBookingID}) has been approved.</p>
             <p><strong>Flight Number:</strong> ${flightBooking.flightNumber}</p>
             <p><strong>From:</strong> ${flightBooking.departureAirport} at ${new Date(flightBooking.departureTime).toLocaleString()}</p>
             <p><strong>To:</strong> ${flightBooking.arrivalAirport} at ${new Date(flightBooking.arrivalTime).toLocaleString()}</p>
             <p><strong>Seat Class:</strong> ${flightBooking.seatClass}</p>
             <p><strong>Price:</strong> ${flightBooking.price}</p>
             <p>Thank you for choosing ExploreEase!</p>`
          );
        } else if (status === 'Rejected') {
          // Send rejection email to user
          await sendEmail(
            flightBooking.user.Email,
            'Flight Booking Rejected',
            `<p>Dear ${flightBooking.user.UserName},</p>
             <p>We regret to inform you that your flight booking (ID: ${flightBooking.FlightBookingID}) has been rejected.</p>
             <p>If you have any questions, please contact our support team.</p>
             <p>Thank you for choosing ExploreEase.</p>`
          );
        }

        // For 'Cancelled' status, send appropriate email if needed
        // Implement as per requirements
      }

      // Update other fields if provided
      if (flightNumber) flightBooking.flightNumber = flightNumber;
      if (departureAirport) flightBooking.departureAirport = departureAirport;
      if (arrivalAirport) flightBooking.arrivalAirport = arrivalAirport;
      if (departureTime) flightBooking.departureTime = departureTime;
      if (arrivalTime) flightBooking.arrivalTime = arrivalTime;
      if (seatClass) flightBooking.seatClass = seatClass;
      if (price) flightBooking.price = price;

      await flightBooking.save();

      res.status(200).json({ success: true, flightBooking });
    } else {
      // Users can update their own flight booking details only if it's still pending
      if (flightBooking.UserID !== userId) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      if (flightBooking.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Cannot edit flight booking that is not pending.' });
      }

      // Update allowed fields (e.g., flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, seatClass, price)
      if (flightNumber) flightBooking.flightNumber = flightNumber;
      if (departureAirport) flightBooking.departureAirport = departureAirport;
      if (arrivalAirport) flightBooking.arrivalAirport = arrivalAirport;
      if (departureTime) flightBooking.departureTime = departureTime;
      if (arrivalTime) flightBooking.arrivalTime = arrivalTime;
      if (seatClass) flightBooking.seatClass = seatClass;
      if (price) flightBooking.price = price;

      await flightBooking.save();

      res.status(200).json({ success: true, flightBooking });
    }
  } catch (error) {
    console.error('Error updating flight booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a flight booking
const deleteFlightBooking = async (req, res) => {
  const flightBookingId = req.params.id;
  const userId = req.userData.UserID;
  const userRole = req.userData.UserType;

  try {
    const flightBooking = await FlightBooking.findOne({ where: { FlightBookingID: flightBookingId } });

    if (!flightBooking) {
      return res.status(404).json({ success: false, message: 'Flight booking not found.' });
    }

    // Allow deletion if admin or the user who made the booking
    if (userRole !== 'Admin' && flightBooking.UserID !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await flightBooking.destroy();

    res.status(200).json({ success: true, message: 'Flight booking deleted successfully.' });
  } catch (error) {
    console.error('Error deleting flight booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createFlightBooking,
  getAllFlightBookings,
  getFlightBookingById,
  updateFlightBooking,
  deleteFlightBooking,
};
