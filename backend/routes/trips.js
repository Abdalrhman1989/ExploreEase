// backend/routes/trips.js

const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { body } = require('express-validator');
const authenticate = require('../middleware/authenticate');

/**
 * @route   POST /api/trips
 * @desc    Create a new trip
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  [
    body('type')
      .isIn(['bus', 'train', 'flight'])
      .withMessage('Type must be bus, train, or flight'),
    body('origin')
      .notEmpty()
      .withMessage('Origin is required'),
    body('destination')
      .notEmpty()
      .withMessage('Destination is required'),
    body('departureTime')
      .isISO8601()
      .withMessage('Departure time must be a valid date'),
    body('arrivalTime')
      .isISO8601()
      .withMessage('Arrival time must be a valid date'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer'),
    // Add more validations as needed
  ],
  tripController.createTrip
);

/**
 * @route   GET /api/trips
 * @desc    Get all trips for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, tripController.getAllTrips);

/**
 * @route   GET /api/trips/:id
 * @desc    Get a single trip by ID
 * @access  Private
 */
router.get('/:id', authenticate, tripController.getTripById);

/**
 * @route   PUT /api/trips/:id
 * @desc    Update a trip by ID
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  [
    body('type')
      .optional()
      .isIn(['bus', 'train', 'flight'])
      .withMessage('Type must be bus, train, or flight'),
    body('origin')
      .optional()
      .notEmpty()
      .withMessage('Origin cannot be empty'),
    body('destination')
      .optional()
      .notEmpty()
      .withMessage('Destination cannot be empty'),
    body('departureTime')
      .optional()
      .isISO8601()
      .withMessage('Departure time must be a valid date'),
    body('arrivalTime')
      .optional()
      .isISO8601()
      .withMessage('Arrival time must be a valid date'),
    body('duration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer'),
    // Add more validations as needed
  ],
  tripController.updateTrip
);

/**
 * @route   DELETE /api/trips/:id
 * @desc    Delete a trip by ID
 * @access  Private
 */
router.delete('/:id', authenticate, tripController.deleteTrip);

module.exports = router;
