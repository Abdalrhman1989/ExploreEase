// routes/favorites.js

const express = require('express');
const router = express.Router();
const { Favorite, User } = require('../models');
const authenticate = require('../middleware/authenticate');
const { body, validationResult } = require('express-validator');

// @route   POST /api/favorites
// @desc    Add a new favorite
// @access  Private
router.post(
  '/',
  authenticate,
  [
    body('type').isIn([
      'car_rental',        // Added 'car_rental'
      'attraction',
      'flight',
      'hotel',
      'restaurant',
      'train_station',
      'subway_station',
      'bus_station',
      'transit_station'
    ]).withMessage('Invalid favorite type'),
    body('placeId').notEmpty().withMessage('placeId is required'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, placeId, name, address, rating, priceLevel, photoReference } = req.body;
    const userId = req.user.uid; // Firebase UID

    try {
      // Find or create the user in the database
      let user = await User.findOne({ where: { FirebaseUID: userId } });
      if (!user) {
        user = await User.create({
          FirebaseUID: userId,
          Email: req.user.email,
          UserName: req.user.name || 'Anonymous',
          FirstName: req.user.firstName || 'First Name',
          LastName: req.user.lastName || 'Last Name',
        });
      }

      // Check if the favorite already exists
      const existingFavorite = await Favorite.findOne({ where: { userId: user.UserID, placeId } });
      if (existingFavorite) {
        return res.status(400).json({ message: 'Favorite already exists' });
      }

      // Create the favorite
      const favorite = await Favorite.create({
        userId: user.UserID,
        type,
        placeId,
        name,
        address,
        rating,
        priceLevel,
        photoReference
      });

      res.status(201).json({ favorite });
    } catch (error) {
      console.error('Error adding favorite:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ... (other routes remain unchanged)

// @route   GET /api/favorites
// @desc    Get all favorites for the authenticated user
// @access  Private
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.uid; // Firebase UID

  try {
    const user = await User.findOne({ 
      where: { FirebaseUID: userId }, 
      include: { model: Favorite, as: 'favorites' }  // Include associated favorites
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/favorites/:id
// @desc    Remove a favorite by ID
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  const userId = req.user.uid; // Firebase UID
  const favoriteId = req.params.id;

  try {
    const user = await User.findOne({ where: { FirebaseUID: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favorite = await Favorite.findOne({ where: { id: favoriteId, userId: user.UserID } });
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    await favorite.destroy();
    res.json({ message: 'Favorite removed' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
