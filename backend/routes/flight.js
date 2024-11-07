const express = require('express');
const router = express.Router();
const { searchFlights } = require('../controllers/flightController');

// @route   POST /api/flights/search-flights
// @desc    Search for flight offers
// @access  Public (You might want to secure this in production)
router.post('/search-flights', searchFlights);

module.exports = router;
