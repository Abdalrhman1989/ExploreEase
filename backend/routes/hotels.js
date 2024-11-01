const express = require('express');
const { body } = require('express-validator');
const hotelController = require('../controllers/hotelController');
const authorize = require('../middleware/authorize');

const router = express.Router();

// 1. Specific Routes First

// Route to get approved hotels with optional city and location filter (Public Access)
router.get('/approved', hotelController.getApprovedHotels);

// Route to get pending hotels (Admin Only)
router.get('/pending', authorize(['Admin']), hotelController.getPendingHotels);

// Route to get authenticated user's hotels (Protected: User, BusinessAdministrator, Admin)
router.get(
  '/user',
  authorize(['User', 'BusinessAdministrator', 'Admin']),
  hotelController.getUserHotels
);

// 2. Dynamic Routes After Specific Routes

// Route to approve a hotel (Admin Only)
router.post('/:id/approve', authorize(['Admin']), hotelController.approveHotel);

// Route to reject a hotel (Admin Only)
router.post('/:id/reject', authorize(['Admin']), hotelController.rejectHotel);

// Route to get a single hotel by ID (Public Access, Approved only)
router.get('/:id', hotelController.getHotelById);

// Route to create a new hotel submission (Protected: User and BusinessAdministrator)
router.post(
  '/',
  authorize(['User', 'BusinessAdministrator']),
  [
    body('name').notEmpty().withMessage('Hotel name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('city').notEmpty().withMessage('City is required'), // Validate city
    body('basePrice').isFloat({ gt: 0 }).withMessage('Base price must be a positive number'),
    body('description').notEmpty().withMessage('Description is required'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude value'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude value'),
    body('availability').isObject().withMessage('Availability must be an object'),
  ],
  hotelController.createHotel
);

// Route to update hotel availability (Admin Only)
router.put(
  '/:id/availability',
  authorize(['Admin']),
  [
    body('availability')
      .isObject()
      .withMessage('Availability must be an object with date keys')
      .custom((value) => {
        // Validate that keys are dates in YYYY-MM-DD format and values are boolean
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
  hotelController.updateHotelAvailability
);

// Route to update hotel details (Full Update) (Protected: Owner or Admin)
router.put(
  '/:id',
  authorize(['Admin', 'User', 'BusinessAdministrator']),
  [
    body('name').notEmpty().withMessage('Hotel name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('city').notEmpty().withMessage('City is required'), // Validate city
    body('basePrice').isFloat({ gt: 0 }).withMessage('Base price must be a positive number'),
    body('description').notEmpty().withMessage('Description is required'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude value'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude value'),
    body('availability').isObject().withMessage('Availability must be an object'),
  ],
  hotelController.updateHotel
);

// Route to delete a hotel by ID (Protected: Owner or Admin)
router.delete(
  '/:id',
  authorize(['Admin', 'User', 'BusinessAdministrator']),
  hotelController.deleteHotel
);

module.exports = router;
