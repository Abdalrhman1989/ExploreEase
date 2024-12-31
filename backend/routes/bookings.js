const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const bookingsController = require('../controllers/bookingsController');
const authorize = require('../middleware/authorize'); // Ensure this middleware exists

// Create a new booking (Accessible by Users and Customers)
router.post(
  '/',
  authorize(['User', 'Customer','Admin']),
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('checkIn').isISO8601().toDate().withMessage('Valid check-in date is required'),
    body('checkOut').isISO8601().toDate().withMessage('Valid check-out date is required'),
    body('guests').isInt({ min: 1 }).withMessage('At least one guest is required'),
    body('hotelId').isInt().withMessage('Hotel ID must be an integer'),
  ],
  bookingsController.createBooking
);

// Get all bookings (Accessible by Admins only)
router.get(
  '/',
  authorize(['Admin']),
  bookingsController.getAllBookings
);

// Get a single booking by ID (Accessible by Admins and the booking owner)
router.get(
  '/:id',
  authorize(['Admin', 'User', 'Customer']),
  param('id').isInt().withMessage('Booking ID must be an integer'),
  bookingsController.getBookingById
);

// Update a booking (Accessible by Admins only)
router.put(
  '/:id',
  authorize(['Admin']),
  param('id').isInt().withMessage('Booking ID must be an integer'),
  [
    body('status').optional().isIn(['Approved', 'Rejected', 'Cancelled']).withMessage('Invalid status'),
    // Add other validations if necessary
  ],
  bookingsController.updateBooking
);

// Delete a booking (Accessible by Admins only)
router.delete(
  '/:id',
  authorize(['Admin']),
  param('id').isInt().withMessage('Booking ID must be an integer'),
  bookingsController.deleteBooking
);

module.exports = router;
