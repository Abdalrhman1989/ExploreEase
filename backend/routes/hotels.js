// backend/routes/hotels.js

const express = require('express');
const { body } = require('express-validator');
const hotelController = require('../controllers/hotelController');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Route to create a new hotel submission (Protected: User and BusinessAdministrator)
router.post(
  '/',
  authorize(['User', 'BusinessAdministrator']),
  [
    body('name').notEmpty().withMessage('Hotel name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('basePrice').isFloat({ gt: 0 }).withMessage('Base price must be a positive number'),
    body('description').notEmpty().withMessage('Description is required'),
    // Additional validations can be added here
    body('availability').isObject().withMessage('Availability must be an object'),
  ],
  hotelController.createHotel
);

// Route to get approved hotels with optional location filter (Public Access)
router.get('/approved', hotelController.getApprovedHotels);

// Route to get pending hotels (Admin Only)
router.get('/pending', authorize(['Admin']), hotelController.getPendingHotels);

// Route to approve a hotel (Admin Only)
router.post('/:id/approve', authorize(['Admin']), hotelController.approveHotel);

// Route to reject a hotel (Admin Only)
router.post('/:id/reject', authorize(['Admin']), hotelController.rejectHotel);

// Route to get a single hotel by ID (Public Access)
router.get('/:id', hotelController.getHotelById);

// **New Route:** Update hotel availability (Admin Only)
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

// **New Route:** Get authenticated user's hotels with optional location filter (Protected: User, BusinessAdministrator, Admin)
router.get(
  '/user',
  authorize(['User', 'BusinessAdministrator', 'Admin']),
  hotelController.getUserHotels
);

module.exports = router;
