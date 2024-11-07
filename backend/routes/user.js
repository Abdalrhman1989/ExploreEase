const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { body } = require('express-validator');
const authenticate = require('../middleware/authenticate');

const itinerariesRouter = require('./itineraries');
const travelStatsRouter = require('./travelStats'); 
router.use('/itineraries', itinerariesRouter);
router.use('/travel-stats', travelStatsRouter);

// profile routes
router.get('/profile', authenticate, userController.getUserDashboard);
router.put(
  '/profile',
  authenticate,
  [
    body('FirstName').optional().isString().withMessage('FirstName must be a string'),
    body('LastName').optional().isString().withMessage('LastName must be a string'),
    body('Email').optional().isEmail().withMessage('Invalid email format'),
    body('PhoneNumber').optional().isString().withMessage('PhoneNumber must be a string'),
  ],
  userController.updateUserProfile
);
router.delete('/profile', authenticate, userController.deleteUserProfile);

module.exports = router;
