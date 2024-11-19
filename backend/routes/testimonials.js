const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const TestimonialsController = require('../controllers/TestimonialsController');

// Public Routes
router.get('/', TestimonialsController.getApprovedTestimonials);
router.post('/', authenticate, TestimonialsController.submitTestimonial);

// Admin Routes
router.get('/pending', authenticate, authorize('Admin'), TestimonialsController.getPendingTestimonials);
router.post('/approve/:id', authenticate, authorize('Admin'), TestimonialsController.approveTestimonial);
router.post('/reject/:id', authenticate, authorize('Admin'), TestimonialsController.rejectTestimonial);

module.exports = router;
