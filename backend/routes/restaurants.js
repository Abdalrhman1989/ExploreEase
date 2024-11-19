const express = require('express');
const { body } = require('express-validator');
const restaurantController = require('../controllers/restaurantController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();


// get approved restaurants
router.get('/approved', restaurantController.getApprovedRestaurants);

// get pending restaurants (Admin Only)
router.get('/pending', authenticate, authorize(['Admin']), restaurantController.getPendingRestaurants);

//get all restaurants (Admin Only 
router.get('/', authenticate, authorize(['Admin']), restaurantController.getAllRestaurants);

// get user's restaurants 
router.get(
  '/user',
  authenticate,
  authorize(['User', 'BusinessAdministrator', 'Admin']),
  restaurantController.getUserRestaurants
);



// approve a restaurant (Admin Only)
router.post('/:id/approve', authenticate, authorize(['Admin']), restaurantController.approveRestaurant);

// reject a restaurant (Admin Only)
router.post('/:id/reject', authenticate, authorize(['Admin']), restaurantController.rejectRestaurant);

// get a single restaurant by ID 
router.get('/:id', restaurantController.getRestaurantById);

// create a new restaurant
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

// update restaurant availability (Admin Only)
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

// update a restaurant's details
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

// delete a restaurant 
router.delete(
  '/:id',
  authenticate,
  authorize(['User', 'BusinessAdministrator', 'Admin']),
  restaurantController.deleteRestaurant
);

module.exports = router;
