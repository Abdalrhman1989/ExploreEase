// backend/routes/restaurants.js

const express = require('express');
const { body } = require('express-validator');
const restaurantController = require('../controllers/restaurantController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

// 1. Specific Routes First

// Route to get approved restaurants with optional location or cuisine filter (Public Access)
router.get('/approved', restaurantController.getApprovedRestaurants);

// Route to get pending restaurants (Admin Only)
router.get('/pending', authenticate, authorize(['Admin']), restaurantController.getPendingRestaurants);

// Route to get all restaurants (Admin Only to see all statuses)
router.get('/', authenticate, authorize(['Admin']), restaurantController.getAllRestaurants);

// Route to get authenticated user's restaurants (Protected: User, BusinessAdministrator, Admin)
router.get(
  '/user',
  authenticate,
  authorize(['User', 'BusinessAdministrator', 'Admin']),
  restaurantController.getUserRestaurants
);

// 2. Dynamic Routes After Specific Routes

// Route to approve a restaurant (Admin Only)
router.post('/:id/approve', authenticate, authorize(['Admin']), restaurantController.approveRestaurant);

// Route to reject a restaurant (Admin Only)
router.post('/:id/reject', authenticate, authorize(['Admin']), restaurantController.rejectRestaurant);

// Route to get a single restaurant by ID (Public Access for Approved only)
router.get('/:id', restaurantController.getRestaurantById);

// Route to create a new restaurant submission (Protected: User and BusinessAdministrator)
router.post(
  '/',
  authenticate,
  authorize(['User', 'BusinessAdministrator']),
  [
    body('name').notEmpty().withMessage('Restaurant name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('cuisine').notEmpty().withMessage('Cuisine is required'),
    body('priceRange').isInt({ min: 1, max: 5 }).withMessage('Price Range must be between 1 and 5'),
    body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('amenities').optional().isArray().withMessage('Amenities must be an array of strings'),
    body('images').optional().isArray().withMessage('Images must be an array of Base64 strings'),
    body('availability')
      .isObject()
      .withMessage('Availability must be an object with date keys')
      .custom((value) => {
        for (const [date, isAvailable] of Object.entries(value)) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD.`);
          }
          if (typeof isAvailable !== 'boolean') {
            throw new Error(`Invalid availability value for ${date}. Expected boolean.`);
          }
        }
        return true;
      }),
  ],
  restaurantController.createRestaurant
);

// Route to update restaurant availability (Admin Only)
router.put(
  '/:id/availability',
  authenticate,
  authorize(['Admin']),
  [
    body('availability')
      .isObject()
      .withMessage('Availability must be an object with date keys')
      .custom((value) => {
        for (const [date, isAvailable] of Object.entries(value)) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD.`);
          }
          if (typeof isAvailable !== 'boolean') {
            throw new Error(`Invalid availability value for ${date}. Expected boolean.`);
          }
        }
        return true;
      }),
  ],
  restaurantController.updateRestaurantAvailability
);

// Route to update a restaurant's details (Protected: Owner or Admin)
router.put(
  '/:id',
  authenticate,
  authorize(['User', 'BusinessAdministrator', 'Admin']),
  [
    body('name').optional().notEmpty().withMessage('Restaurant name cannot be empty'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty'),
    body('cuisine').optional().notEmpty().withMessage('Cuisine cannot be empty'),
    body('priceRange').optional().isInt({ min: 1, max: 5 }).withMessage('Price Range must be between 1 and 5'),
    body('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('amenities').optional().isArray().withMessage('Amenities must be an array of strings'),
    body('images').optional().isArray().withMessage('Images must be an array of Base64 strings'),
    body('availability')
      .optional()
      .isObject()
      .withMessage('Availability must be an object with date keys')
      .custom((value) => {
        if (value) {
          for (const [date, isAvailable] of Object.entries(value)) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
              throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD.`);
            }
            if (typeof isAvailable !== 'boolean') {
              throw new Error(`Invalid availability value for ${date}. Expected boolean.`);
            }
          }
        }
        return true;
      }),
  ],
  restaurantController.updateRestaurant
);

// Route to delete a restaurant (Protected: Owner or Admin)
router.delete(
  '/:id',
  authenticate,
  authorize(['User', 'BusinessAdministrator', 'Admin']),
  restaurantController.deleteRestaurant
);

module.exports = router;
