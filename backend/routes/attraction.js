// backend/routes/attractionRoutes.js

const express = require('express');
const { body } = require('express-validator');
const attractionController = require('../controllers/attractionController');
const authorize = require('../middleware/authorize');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// 1. Public Routes (No Authentication Required)
router.get('/approved', attractionController.getApprovedAttractions);

// 2. Apply Authentication Middleware to Protect Subsequent Routes
router.use(authenticate);

// 3. Protected Routes (Authentication Required)

// Route to get all pending attractions (Admin Only)
router.get(
  '/pending',
  authorize(['Admin']),
  attractionController.getPendingAttractions
);

// Route to approve an attraction (Admin Only)
router.post(
  '/:id/approve',
  authorize(['Admin']),
  attractionController.approveAttraction
);

// Route to reject an attraction (Admin Only)
router.post(
  '/:id/reject',
  authorize(['Admin']),
  attractionController.rejectAttraction
);

// Route to create a new attraction submission (Protected: 'User' and 'BusinessAdministrator')
router.post(
  '/',
  authorize(['User', 'BusinessAdministrator']),
  [
    body('name').notEmpty().withMessage('Attraction name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('entryFee')
      .isFloat({ min: 0 })
      .withMessage('Entry fee must be a positive number'),
    body('openingHours').notEmpty().withMessage('Opening hours are required'),
    body('amenities').isArray().optional(),
    body('images').isArray().optional(),
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Valid latitude is required'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Valid longitude is required'),
  ],
  attractionController.createAttraction
);

// Route to get authenticated user's attractions (Protected: 'User', 'BusinessAdministrator', 'Admin')
router.get(
  '/user',
  authorize(['User', 'BusinessAdministrator', 'Admin']),
  attractionController.getUserAttractions
);

// Route to delete an attraction (Protected: 'Admin', 'User', 'BusinessAdministrator')
router.delete(
  '/:id',
  authorize(['Admin', 'User', 'BusinessAdministrator']),
  attractionController.deleteAttraction
);

// Route to update an attraction (Protected: 'Admin', 'User', 'BusinessAdministrator')
router.put(
  '/:id',
  authorize(['Admin', 'User', 'BusinessAdministrator']),
  [
    body('name').optional().notEmpty().withMessage('Attraction name cannot be empty'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty'),
    body('type').optional().notEmpty().withMessage('Type cannot be empty'),
    body('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('amenities').optional().isArray(),
    body('images').optional().isArray(),
  ],
  attractionController.updateAttraction
);

// Make GET /:id public by defining it after other routes
router.get('/:id', attractionController.getAttractionById);

module.exports = router;
