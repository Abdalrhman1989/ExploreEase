const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { body } = require('express-validator');
const authenticate = require('../middleware/authenticate');

// Import other routers
const itinerariesRouter = require('./itineraries');
const travelStatsRouter = require('./travelStats'); // Add this line

// Mount each router
router.use('/itineraries', itinerariesRouter);
router.use('/travel-stats', travelStatsRouter);

module.exports = router;
