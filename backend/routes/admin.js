// backend/routes/admin.js

const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const {
  getAllUsers,
  updateUser,
  deleteUser,
  createUser, // Import the createUser controller
} = require('../controllers/adminController');

// Admin Dashboard Route
router.get('/dashboard', authorize('Admin'), (req, res) => {
  res.status(200).json({ message: 'Welcome to the Admin Dashboard', user: req.userData });
});

// Get all users
router.get('/users', authorize('Admin'), getAllUsers);

// Create a new user
router.post('/users', authorize('Admin'), createUser); // Ensure createUser is defined

// Update a user
router.put('/users/:userId', authorize('Admin'), updateUser);

// Delete a user
router.delete('/users/:userId', authorize('Admin'), deleteUser);

module.exports = router;
