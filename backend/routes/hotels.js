const express = require('express');
const { body } = require('express-validator');
const hotelController = require('../controllers/hotelController');
const authorize = require('../middleware/authorize');

const router = express.Router();



// get approved hotels 
router.get('/approved', hotelController.getApprovedHotels);

// get pending hotels (Admin Only)
router.get('/pending', authorize(['Admin']), hotelController.getPendingHotels);

// get user's hotels 
router.get(
  '/user',
  authorize(['User', 'BusinessAdministrator', 'Admin']),
  hotelController.getUserHotels
);



// approve a hotel (Admin Only)
router.post('/:id/approve', authorize(['Admin']), hotelController.approveHotel);

// reject a hotel (Admin Only)
router.post('/:id/reject', authorize(['Admin']), hotelController.rejectHotel);

// get a single hotel by ID
router.get('/:id', hotelController.getHotelById);

// create a new hotel
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

// update hotel availability
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
  hotelController.updateHotelAvailability
);

// update hotel details (Full Update)
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

// delete a hotel by ID
router.delete(
  '/:id',
  authorize(['Admin', 'User', 'BusinessAdministrator']),
  hotelController.deleteHotel
);

module.exports = router;