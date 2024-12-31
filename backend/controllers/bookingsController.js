const { Booking, Hotel, User, Payment } = require('../models');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer'); 
require('dotenv').config(); 

// Check if essential environment variables are present
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Error: Missing EMAIL_USER or EMAIL_PASS in environment variables.');
  process.exit(1); 
}

// Configure Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
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
      from: `"ExploreEase" <${process.env.EMAIL_USER}>`, 
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

// Helper function to calculate booking amount
const calculateBookingAmount = (booking) => {
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const timeDiff = checkOutDate - checkInDate;
  const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Define room prices based on room type
  const roomPrices = {
    'Single': 100,
    'Double': 150,
    'Suite': 200,
    // Add other room types and their prices as needed
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
    roomType, 
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
    // Example:
    // const isAvailable = await checkRoomAvailability(hotelId, roomType, checkIn, checkOut);
    // if (!isAvailable) {
    //   return res.status(400).json({ success: false, message: 'Selected room is not available for the chosen dates.' });
    // }

    // Create the booking with status 'Pending'
    const booking = await Booking.create({
      UserID: userId, 
      HotelID: hotelId,
      fullName,
      email,
      phone,
      checkIn,
      checkOut,
      guests,
      roomType,
      status: 'Pending', 
    });

    console.log('Booking created:', booking);

    // Fetch associated hotel details
    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    // Send a notification email to the user about the booking creation
    await sendEmail(
      user.Email,
      'Booking Received',
      `<p>Dear ${user.UserName},</p>
       <p>We have received your booking request for a <strong>${booking.roomType}</strong> room at <strong>${hotel.name}</strong> from <strong>${new Date(booking.checkIn).toLocaleDateString()}</strong> to <strong>${new Date(booking.checkOut).toLocaleDateString()}</strong>.</p>
       <p>Your booking is currently pending approval. You will receive a confirmation email once the booking is approved.</p>
       <p>Thank you for choosing ExploreEase!</p>`
    );

    // Send a notification email to the admin
    if (process.env.ADMIN_EMAIL) {
      await sendEmail(
        process.env.ADMIN_EMAIL,
        'New Booking Received',
        `<p>A new booking has been received:</p>
         <p><strong>Booking ID:</strong> ${booking.BookingID}</p>
         <p><strong>User:</strong> ${user.UserName} (${user.Email})</p>
         <p><strong>Hotel:</strong> ${hotel.name}</p>
         <p><strong>Room Type:</strong> ${booking.roomType}</p>
         <p><strong>Check-In:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
         <p><strong>Check-Out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
         <p><strong>Guests:</strong> ${booking.guests}</p>`
      );
    }

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
    const userRole = req.userData.UserType; 
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

      if (userRole === 'Admin') {
        // Admin can update status and other details
        if (status && ['Approved', 'Rejected', 'Cancelled'].includes(status)) {
          booking.status = status;

          if (status === 'Approved') {
            await sendEmail(
              booking.user.Email,
              'Booking Approved',
              `<p>Dear ${booking.user.UserName},</p>
              <p>Your booking (ID: ${booking.BookingID}) for a <strong>${booking.roomType}</strong> room at <strong>${booking.hotel.name}</strong> from <strong>${new Date(booking.checkIn).toLocaleDateString()}</strong> to <strong>${new Date(booking.checkOut).toLocaleDateString()}</strong> has been approved.</p>
              <p>Payment Details:</p>
              <ul>
                <li>Amount: $${(booking.payment.amount / 100).toFixed(2)}</li>
                <li>Payment Method: ${booking.payment.paymentMethod}</li>
                <li>Receipt: <a href="${booking.payment.receiptUrl}" target="_blank" rel="noopener noreferrer">View Receipt</a></li>
              </ul>
              <p>Thank you for choosing ExploreEase!</p>`
            );
          } else if (status === 'Rejected') {
            // Send rejection email to user
            await sendEmail(
              booking.user.Email,
              'Booking Rejected',
              `<p>Dear ${booking.user.UserName},</p>
              <p>We regret to inform you that your booking (ID: ${booking.BookingID}) for a <strong>${booking.roomType}</strong> room at <strong>${booking.hotel.name}</strong> from <strong>${new Date(booking.checkIn).toLocaleDateString()}</strong> to <strong>${new Date(booking.checkOut).toLocaleDateString()}</strong> has been rejected.</p>
              <p>If you have any questions, please contact our support team.</p>
              <p>Thank you for choosing ExploreEase.</p>`
            );
          }

          // For 'Cancelled' status, send appropriate email if needed
          // Implement as per requirements
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

        // Update allowed fields (e.g., phone, checkIn, checkOut, guests, roomType)
        const { phone, checkIn, checkOut, guests, roomType } = req.body;

        if (phone) booking.phone = phone;
        if (checkIn) booking.checkIn = checkIn;
        if (checkOut) booking.checkOut = checkOut;
        if (guests) booking.guests = guests;
        if (roomType) booking.roomType = roomType;

        // Optionally, recalculate the amount if roomType or dates have changed
        // Not implemented here; can be added as needed

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
    const userRole = req.userData.UserType;

    try {
      const booking = await Booking.findOne({ where: { BookingID: bookingId } });

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      // Allow deletion if admin or the user who made the booking
      if (userRole !== 'Admin' && booking.UserID !== userId) {
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
