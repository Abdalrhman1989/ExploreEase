const express = require('express');
const { body } = require('express-validator');
const restaurantController = require('../controllers/restaurantController');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Route to create a new restaurant submission (Protected: User and BusinessAdministrator)
router.post(
  '/',
  authorize(['User', 'BusinessAdministrator']),
  [
    body('name').notEmpty().withMessage('Restaurant name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('cuisine').notEmpty().withMessage('Cuisine is required'),
    body('priceRange')
      .isInt({ min: 1, max: 5 })
      .withMessage('Price range must be between 1 and 5'),
    body('rating')
      .isFloat({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('availability').isObject().withMessage('Availability must be an object'),
  ],
  restaurantController.createRestaurant
);

// Route to get approved restaurants with optional location or cuisine filter (Public Access)
router.get('/approved', restaurantController.getApprovedRestaurants);

// Route to get pending restaurants (Admin Only)
router.get('/pending', authorize(['Admin']), restaurantController.getPendingRestaurants);

// Route to approve a restaurant (Admin Only)
router.post('/:id/approve', authorize(['Admin']), restaurantController.approveRestaurant);

// Route to reject a restaurant (Admin Only)
router.post('/:id/reject', authorize(['Admin']), restaurantController.rejectRestaurant);

// Route to get a single restaurant by ID (Public Access)
router.get('/:id', restaurantController.getRestaurantById);

// Update restaurant availability (Admin Only)
router.put(
  '/:id/availability',
  authorize(['Admin']),
  [
    body('availability')
      .isObject()
      .withMessage('Availability must be an object with date keys')
      .custom((value) => {
        for (const [date, available] of Object.entries(value)) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD.`);
          }
          if (typeof available !== 'boolean') {
            throw new Error(`Invalid availability value for ${date}. Expected boolean.`);
          }
        }
        return true;
      }),
  ],
  restaurantController.updateRestaurantAvailability
);

// Get authenticated user's restaurants (Protected: User, BusinessAdministrator, Admin)
router.get(
  '/user',
  authorize(['User', 'BusinessAdministrator', 'Admin']),
  restaurantController.getUserRestaurants
);

module.exports = router;
