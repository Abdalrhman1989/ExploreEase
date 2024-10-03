// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { syncUser } = require('../controllers/authController');

// Registration Synchronization Endpoint
router.post('/sync', authenticate, syncUser);

module.exports = router;
