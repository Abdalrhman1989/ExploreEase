const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models');
const { body, validationResult } = require('express-validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// POST /api/testimonials - Submit a testimonial
router.post('/',
  authenticate,
  [
    body('content').isLength({ min: 10 }).withMessage('Testimonial content must be at least 10 characters long'),
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Testimonial submission validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { content } = req.body;
    const user = req.user; // Authenticated user

    try {
      const testimonial = await Testimonial.create({
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        content,
        status: 'pending',
      });

      console.info(`New testimonial submitted by ${user.email}`);

      res.status(201).json({ success: true, message: 'Testimonial submitted and awaiting approval.', testimonial });
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      res.status(500).json({ success: false, message: 'Failed to submit testimonial. Please try again later.' });
    }
  }
);

// GET /api/testimonials - Get all approved testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      where: { status: 'approved' },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch testimonials.' });
  }
});

// GET /api/testimonials/pending - Get all pending testimonials (Admin)
router.get('/pending',
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    try {
      const testimonials = await Testimonial.findAll({
        where: { status: 'pending' },
        order: [['createdAt', 'DESC']],
      });
      res.json({ success: true, testimonials });
    } catch (error) {
      console.error('Error fetching pending testimonials:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch pending testimonials.' });
    }
  }
);

// PUT /api/testimonials/:id/approve - Approve a testimonial (Admin)
router.put('/:id/approve',
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      const testimonial = await Testimonial.findByPk(id);
      if (!testimonial) {
        return res.status(404).json({ success: false, message: 'Testimonial not found.' });
      }
      testimonial.status = 'approved';
      await testimonial.save();

      console.info(`Testimonial ID ${id} approved by admin.`);

      res.json({ success: true, message: 'Testimonial approved successfully.', testimonial });
    } catch (error) {
      console.error(`Error approving testimonial ID ${id}:`, error);
      res.status(500).json({ success: false, message: 'Failed to approve testimonial.' });
    }
  }
);

// PUT /api/testimonials/:id/reject - Reject a testimonial (Admin)
router.put('/:id/reject',
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      const testimonial = await Testimonial.findByPk(id);
      if (!testimonial) {
        return res.status(404).json({ success: false, message: 'Testimonial not found.' });
      }
      testimonial.status = 'rejected';
      await testimonial.save();

      console.info(`Testimonial ID ${id} rejected by admin.`);

      res.json({ success: true, message: 'Testimonial rejected successfully.', testimonial });
    } catch (error) {
      console.error(`Error rejecting testimonial ID ${id}:`, error);
      res.status(500).json({ success: false, message: 'Failed to reject testimonial.' });
    }
  }
);

module.exports = router;
