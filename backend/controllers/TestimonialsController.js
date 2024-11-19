const { Testimonial, User } = require('../models');

// Get all approved testimonials

exports.getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      where: { status: 'approved' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['UserID', 'UserName', 'FirstName', 'LastName', 'ProfilePicture']
      }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, testimonials });
  } catch (error) {
    console.error('Error fetching approved testimonials:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// Submit a new testimonial 

exports.submitTestimonial = async (req, res) => {
  const { content } = req.body;
  const firebaseUID = req.user.uid;

  if (!content || content.trim() === '') {
    return res.status(400).json({ success: false, message: 'Testimonial content is required.' });
  }

  try {
    const user = await User.findOne({ where: { FirebaseUID: firebaseUID } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const testimonial = await Testimonial.create({
      UserID: user.UserID,
      userName: `${user.FirstName} ${user.LastName}`,
      userEmail: user.Email,
      content,
      status: 'pending', 
    });

    res.status(201).json({
      success: true,
      message: 'Testimonial submitted successfully and is pending approval.',
      testimonial
    });
  } catch (error) {
    console.error('Error submitting testimonial:', error);

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// Get all pending testimonials 

exports.getPendingTestimonials = async (req, res) => {
  try {
    const pendingTestimonials = await Testimonial.findAll({
      where: { status: 'pending' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['UserID', 'UserName', 'FirstName', 'LastName', 'ProfilePicture', 'Email']
      }],
      order: [['createdAt', 'ASC']],
    });
    res.json({ success: true, testimonials: pendingTestimonials });
  } catch (error) {
    console.error('Error fetching pending testimonials:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// Approve a testimonial
exports.approveTestimonial = async (req, res) => {
  const testimonialId = req.params.id;

  try {
    const testimonial = await Testimonial.findByPk(testimonialId);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }

    testimonial.status = 'approved';
    await testimonial.save();

    res.json({ success: true, message: 'Testimonial approved successfully.', testimonial });
  } catch (error) {
    console.error('Error approving testimonial:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// Reject a testimonial
exports.rejectTestimonial = async (req, res) => {
  const testimonialId = req.params.id;

  try {
    const testimonial = await Testimonial.findByPk(testimonialId);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }

    testimonial.status = 'rejected';
    await testimonial.save();

    res.json({ success: true, message: 'Testimonial rejected successfully.', testimonial });
  } catch (error) {
    console.error('Error rejecting testimonial:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};
