const { Trip, User } = require('../models');
const { validationResult } = require('express-validator');

// Create a new trip
const createTrip = async (req, res) => {

  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());

    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      type,
      origin,
      destination,
      departureTime,
      arrivalTime,
      duration,
      transitStops,
      transitLines,
      schedule,
      ticketProviderUrl,
    } = req.body;
    const firebaseUid = req.user.uid; 

    const user = await User.findOne({ where: { FirebaseUID: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found:', user.toJSON());
    if (!user.UserID) {
      console.error('User.UserID is null or undefined:', user.UserID);
      return res.status(500).json({ message: 'Internal Server Error: UserID is missing.' });
    }
    // Create new trip
    const newTrip = await Trip.create({
      UserID: user.UserID,
      type,
      origin,
      destination,
      departureTime,
      arrivalTime,
      duration,
      transitStops,
      transitLines,
      schedule,
      ticketProviderUrl,
    });

    res.status(201).json(newTrip); 
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all trips 

const getAllTrips = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;

    const user = await User.findOne({
      where: { FirebaseUID: firebaseUid },
      include: [{ model: Trip, as: 'trips' }],
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get a single trip by ID

const getTripById = async (req, res) => {
  const tripId = req.params.id;
  const firebaseUid = req.user.uid;

  try {
    const user = await User.findOne({ where: { FirebaseUID: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const trip = await Trip.findOne({ where: { id: tripId, userId: user.UserID } });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a trip by ID
const updateTrip = async (req, res) => {
  const tripId = req.params.id;
  const firebaseUid = req.user.uid;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findOne({ where: { FirebaseUID: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const trip = await Trip.findOne({ where: { id: tripId, userId: user.UserID } });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const updatedData = req.body;
    await trip.update(updatedData);

    res.json(trip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a trip by ID
const deleteTrip = async (req, res) => {
  const tripId = req.params.id;
  const firebaseUid = req.user.uid;

  try {
    const user = await User.findOne({ where: { FirebaseUID: firebaseUid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const trip = await Trip.findOne({ where: { id: tripId, userId: user.UserID } });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    await trip.destroy();

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
};
