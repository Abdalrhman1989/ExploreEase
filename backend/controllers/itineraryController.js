// backend/controllers/itineraryController.js

const { Itinerary, User } = require('../models');
const { validationResult } = require('express-validator');

// Create a new itinerary
const createItinerary = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, destinations, startDate, endDate, notes } = req.body;
  const firebaseUid = req.user.uid; // Use 'uid' instead of 'id'

  try {
    // Find user by FirebaseUID
    const user = await User.findOne({ where: { FirebaseUID: firebaseUid } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const itinerary = await Itinerary.create({
      name,
      destinations,
      startDate,
      endDate,
      notes,
      userId: user.UserID, // Assign 'userId' correctly
    });

    res.status(201).json({ success: true, itinerary });
  } catch (error) {
    console.error('Error creating itinerary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all itineraries for the user
const getItineraries = async (req, res) => {
  const firebaseUid = req.user.uid;

  try {
    const user = await User.findOne({
      where: { FirebaseUID: firebaseUid },
      include: [{ model: Itinerary, as: 'itineraries' }],
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, itineraries: user.itineraries });
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a single itinerary by ID
const getItineraryById = async (req, res) => {
  const itineraryId = req.params.id;
  const firebaseUid = req.user.uid;

  try {
    const user = await User.findOne({ where: { FirebaseUID: firebaseUid } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const itinerary = await Itinerary.findOne({
      where: { id: itineraryId, userId: user.UserID },
    });

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    res.status(200).json({ success: true, itinerary });
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update an itinerary by ID
const updateItinerary = async (req, res) => {
  const itineraryId = req.params.id;
  const { name, destinations, startDate, endDate, notes } = req.body;
  const firebaseUid = req.user.uid;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const user = await User.findOne({ where: { FirebaseUID: firebaseUid } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const itinerary = await Itinerary.findOne({
      where: { id: itineraryId, userId: user.UserID },
    });

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    // Update fields if provided
    if (name) itinerary.name = name;
    if (destinations) itinerary.destinations = destinations;
    if (startDate) itinerary.startDate = startDate;
    if (endDate) itinerary.endDate = endDate;
    if (notes) itinerary.notes = notes;

    await itinerary.save();

    res.status(200).json({ success: true, itinerary });
  } catch (error) {
    console.error('Error updating itinerary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete an itinerary by ID
const deleteItinerary = async (req, res) => {
  const itineraryId = req.params.id;
  const firebaseUid = req.user.uid;

  try {
    const user = await User.findOne({ where: { FirebaseUID: firebaseUid } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const itinerary = await Itinerary.findOne({
      where: { id: itineraryId, userId: user.UserID },
    });

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    await itinerary.destroy();

    res.status(200).json({ success: true, message: 'Itinerary deleted successfully' });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createItinerary,
  getItineraries,
  getItineraryById,
  updateItinerary,
  deleteItinerary,
};