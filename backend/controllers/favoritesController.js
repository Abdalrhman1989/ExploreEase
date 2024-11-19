const { Favorite, User } = require('../models');
const { validationResult } = require('express-validator');

// Add a new favorite
exports.addFavorite = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, placeId, name, address, rating, priceLevel, photoReference } = req.body;
  const userId = req.user.uid; 

  try {
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
};

// Get all favorites for the user
exports.getFavorites = async (req, res) => {
  const userId = req.user.uid; 

  try {
    const user = await User.findOne({ 
      where: { FirebaseUID: userId }, 
      include: { model: Favorite, as: 'favorites' } 
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a favorite by ID
exports.updateFavorite = async (req, res) => {
  console.log(`PUT /api/favorites/${req.params.id} - Received request`); 

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation Errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, placeId, name, address, rating, priceLevel, photoReference } = req.body;
  const userId = req.user.uid; 
  const favoriteId = req.params.id;

  try {
    console.log(`User UID: ${userId}`);
    const user = await User.findOne({ where: { FirebaseUID: userId } });
    if (!user) {
      console.log('User not found.');
      return res.status(404).json({ message: 'User not found' });
    }

    const favorite = await Favorite.findOne({ where: { id: favoriteId, userId: user.UserID } });
    if (!favorite) {
      console.log(`Favorite with ID ${favoriteId} not found for user ID ${user.UserID}.`);
      return res.status(404).json({ message: 'Favorite not found' });
    }

    if (type) favorite.type = type;
    if (placeId) favorite.placeId = placeId;
    if (name) favorite.name = name;
    if (address) favorite.address = address;
    if (rating !== undefined) favorite.rating = rating;
    if (priceLevel !== undefined) favorite.priceLevel = priceLevel;
    if (photoReference) favorite.photoReference = photoReference;

    await favorite.save();

    console.log(`Favorite with ID ${favoriteId} updated successfully.`);
    res.json({ favorite });
  } catch (error) {
    console.error('Error updating favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove a favorite by ID
exports.removeFavorite = async (req, res) => {
  const userId = req.user.uid; 
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
};
