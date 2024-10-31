const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { body } = require('express-validator');
const recommendationController = require('../controllers/recommendationController');

// Apply authentication middleware to all recommendation routes
router.use(authenticate);

/**
 * @route   GET /api/recommendations
 * @desc    Get all recommendations for the authenticated user
 * @access  Private
 */
router.get('/', recommendationController.getRecommendations);

/**
 * @route   POST /api/recommendations
 * @desc    Create a new recommendation
 * @access  Private (Consider restricting to Admin or system-generated)
 */
router.post(
  '/',
  [
    body('content').notEmpty().withMessage('Content is required'),
    body('category').notEmpty().withMessage('Category is required'),
    // Additional validations can be added here
  ],
  recommendationController.createRecommendation
);

module.exports = router;
