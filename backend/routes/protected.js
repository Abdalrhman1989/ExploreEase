// backend/routes/protected.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getUserDashboard } = require('../controllers/userController');

// Apply 'authenticate' middleware to all routes in this router
router.use(authenticate);

// Example Protected Endpoint
router.get('/dashboard', getUserDashboard);

module.exports = router;
