const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { body } = require('express-validator');
const itineraryController = require('../controllers/itineraryController');
router.use(authenticate);

/**
 * @route   POST /api/itineraries
 * @desc    Create a new itinerary
 * @access  Private
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('destinations').isArray({ min: 1 }).withMessage('At least one destination is required'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').isISO8601().withMessage('End date must be a valid date'),
    // Additional validations can be added here
  ],
  itineraryController.createItinerary
);

/**
 * @route   GET /api/itineraries
 * @desc    Get all itineraries for the authenticated user
 * @access  Private
 */
router.get('/', itineraryController.getItineraries);

/**
 * @route   GET /api/itineraries/:id
 * @desc    Get a single itinerary by ID
 * @access  Private
 */
router.get('/:id', itineraryController.getItineraryById);

/**
 * @route   PUT /api/itineraries/:id
 * @desc    Update an itinerary by ID
 * @access  Private
 */
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('destinations').optional().isArray().withMessage('Destinations must be an array'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    // Additional validations can be added here
  ],
  itineraryController.updateItinerary
);

/**
 * @route   DELETE /api/itineraries/:id
 * @desc    Delete an itinerary by ID
 * @access  Private
 */
router.delete('/:id', itineraryController.deleteItinerary);

module.exports = router;
