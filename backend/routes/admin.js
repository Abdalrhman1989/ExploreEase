// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');

// Example Admin Dashboard Route
router.get('/dashboard', authorize('Admin'), (req, res) => {
  // Access req.userData for user details
  res.status(200).json({ message: 'Welcome to the Admin Dashboard', user: req.userData });
});

module.exports = router;
