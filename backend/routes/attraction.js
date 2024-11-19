const express = require('express');
const { body } = require('express-validator');
const attractionController = require('../controllers/attractionController');
const authorize = require('../middleware/authorize');
const authenticate = require('../middleware/authenticate');

const router = express.Router();


router.get('/approved', attractionController.getApprovedAttractions);


router.use(authenticate);


router.get(
  '/pending',
  authorize(['Admin']),
  attractionController.getPendingAttractions
);

router.post(
  '/:id/approve',
  authorize(['Admin']),
  attractionController.approveAttraction
);


router.post(
  '/:id/reject',
  authorize(['Admin']),
  attractionController.rejectAttraction
);


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

router.get(
  '/user',
  authorize(['User', 'BusinessAdministrator', 'Admin']),
  attractionController.getUserAttractions
);


router.delete(
  '/:id',
  authorize(['Admin', 'User', 'BusinessAdministrator']),
  attractionController.deleteAttraction
);


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

router.get('/:id', attractionController.getAttractionById);

module.exports = router;