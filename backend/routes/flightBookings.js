// backend/routes/flightBookings.js

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const flightBookingsController = require('../controllers/flightBookingsController');
const authorize = require('../middleware/authorize'); // Ensure this middleware exists

// Create a new flight booking (Accessible by Users, Customers, and Admins)
router.post(
  '/',
  authorize(['User', 'Customer', 'Admin']),
  [
    body('flightNumber').notEmpty().withMessage('Flight number is required'),
    body('departureAirport').notEmpty().withMessage('Departure airport is required'),
    body('arrivalAirport').notEmpty().withMessage('Arrival airport is required'),
    body('departureTime').isISO8601().toDate().withMessage('Valid departure time is required'),
    body('arrivalTime').isISO8601().toDate().withMessage('Valid arrival time is required'),
    body('seatClass').notEmpty().withMessage('Seat class is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('dateOfBirth').isISO8601().toDate().withMessage('Valid date of birth is required'),
    body('passportNumber').notEmpty().withMessage('Passport number is required'),
    body('issuanceDate').isISO8601().toDate().withMessage('Valid issuance date is required'),
    body('expiryDate').isISO8601().toDate().withMessage('Valid expiry date is required'),
    body('issuanceCountry').isLength({ min: 2, max: 3 }).withMessage('Issuance country code is required'),
    body('nationality').isLength({ min: 2, max: 3 }).withMessage('Nationality code is required'),
  ],
  flightBookingsController.createFlightBooking
);

// Get all flight bookings (Accessible by Admins only)
router.get(
  '/',
  authorize(['Admin']),
  flightBookingsController.getAllFlightBookings
);

// Get a single flight booking by ID (Accessible by Admins and the booking owner)
router.get(
  '/:id',
  authorize(['Admin', 'User', 'Customer']),
  param('id').isInt().withMessage('FlightBooking ID must be an integer'),
  flightBookingsController.getFlightBookingById
);

// Update a flight booking (Accessible by Admins and owners under certain conditions)
router.put(
  '/:id',
  authorize(['Admin', 'User', 'Customer']),
  param('id').isInt().withMessage('FlightBooking ID must be an integer'),
  [
    body('status').optional().isIn(['Approved', 'Rejected', 'Cancelled']).withMessage('Invalid status'),
    body('flightNumber').optional().notEmpty().withMessage('Flight number cannot be empty'),
    body('departureAirport').optional().notEmpty().withMessage('Departure airport cannot be empty'),
    body('arrivalAirport').optional().notEmpty().withMessage('Arrival airport cannot be empty'),
    body('departureTime').optional().isISO8601().toDate().withMessage('Valid departure time is required'),
    body('arrivalTime').optional().isISO8601().toDate().withMessage('Valid arrival time is required'),
    body('seatClass').optional().notEmpty().withMessage('Seat class cannot be empty'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  ],
  flightBookingsController.updateFlightBooking
);

// Delete a flight booking (Accessible by Admins and owners)
router.delete(
  '/:id',
  authorize(['Admin', 'User', 'Customer']),
  param('id').isInt().withMessage('FlightBooking ID must be an integer'),
  flightBookingsController.deleteFlightBooking
);

module.exports = router;
