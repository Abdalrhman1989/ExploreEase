const express = require('express');
const router = express.Router();
const travelStatsController = require('../controllers/travelStatsController');
const authenticate = require('../middleware/authenticate');


router.get('/', authenticate, travelStatsController.getTravelStats);

module.exports = router;
