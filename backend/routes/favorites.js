const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { body } = require('express-validator');
const favoritesController = require('../controllers/favoritesController');


const favoriteValidationRules = [
  body('type').isIn([
    'car_rental',
    'attraction',
    'flight',
    'hotel',
    'restaurant',
    'train_station',
    'subway_station',
    'bus_station',
    'transit_station'
  ]).withMessage('Invalid favorite type'),
  body('placeId').notEmpty().withMessage('placeId is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('priceLevel').optional({ nullable: true }).isInt({ min: 1, max: 5 }).withMessage('Price Level must be between 1 and 5'),
  body('photoReference').optional().isString().withMessage('photoReference must be a string'),

];

// @route   POST /api/favorites
// @desc    Add a new favorite
// @access  Private
router.post('/', authenticate, favoriteValidationRules, favoritesController.addFavorite);

// @route   GET /api/favorites
// @desc    Get all favorites for the authenticated user
// @access  Private
router.get('/', authenticate, favoritesController.getFavorites);

// @route   PUT /api/favorites/:id
// @desc    Update a favorite by ID
// @access  Private
router.put(
  '/:id',
  authenticate,
  [
    body('type').optional().isIn([
      'car_rental',
      'attraction',
      'flight',
      'hotel',
      'restaurant',
      'train_station',
      'subway_station',
      'bus_station',
      'transit_station'
    ]).withMessage('Invalid favorite type'),
    body('placeId').optional().notEmpty().withMessage('placeId cannot be empty'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('priceLevel').optional().isInt({ min: 1, max: 5 }).withMessage('Price Level must be between 1 and 5'),
    body('photoReference').optional().isString().withMessage('photoReference must be a string'),
    
  ],
  favoritesController.updateFavorite
);

// @route   DELETE /api/favorites/:id
// @desc    Remove a favorite by ID
// @access  Private
router.delete('/:id', authenticate, favoritesController.removeFavorite);

module.exports = router;
