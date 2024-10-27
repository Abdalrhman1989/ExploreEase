// backend/controllers/attractionController.js

const { Attraction } = require('../models');
const { validationResult } = require('express-validator');
const axios = require('axios');

// Create a new Attraction (Accessible by 'User' and 'BusinessAdministrator')
exports.createAttraction = async (req, res) => {
  // Validate incoming request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const {
      name,
      location,
      city,
      type,
      entryFee,
      openingHours,
      description,
      amenities,
      images,
      latitude,
      longitude,
    } = req.body;

    const FirebaseUID = req.user.uid; // Extracted from authentication middleware

    const newAttraction = await Attraction.create({
      FirebaseUID,
      name,
      location,
      city,
      type,
      entryFee,
      openingHours,
      description,
      amenities,
      images,
      latitude,
      longitude,
    });

    res.status(201).json({
      message: 'Attraction submitted successfully and is pending approval.',
      attraction: newAttraction,
    });
  } catch (error) {
    console.error('Error creating attraction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all Approved Attractions (Public Access) with optional city filtering
exports.getApprovedAttractions = async (req, res) => {
  try {
    const { city } = req.query;
    const whereClause = { status: 'Approved' };
    if (city) {
      whereClause.city = city;
    }
    const attractions = await Attraction.findAll({ where: whereClause });
    res.status(200).json({ attractions });
  } catch (error) {
    console.error('Error fetching approved attractions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a Single Attraction by ID (Public Access)
exports.getAttractionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isNaN(id)) {
      // User-Created Attraction (AttractionID is an integer)
      const attraction = await Attraction.findByPk(id);

      if (!attraction) {
        return res.status(404).json({ message: 'Attraction not found' });
      }

      // Only return approved attractions to the public
      if (attraction.status !== 'Approved') {
        return res.status(403).json({ message: 'Forbidden: Attraction not approved' });
      }

      res.status(200).json({ attraction });
    } else {
      // Google Place (place_id is a string)
      const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&fields=name,rating,price_level,formatted_address,photos,reviews,website,url,geometry&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (response.data.status !== 'OK') {
        return res.status(404).json({ message: 'Place not found' });
      }

      res.status(200).json({ place: response.data.result });
    }
  } catch (error) {
    console.error('Error fetching attraction details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all Pending Attractions (Admin Only)
exports.getPendingAttractions = async (req, res) => {
  try {
    const attractions = await Attraction.findAll({ where: { status: 'Pending' } });
    res.status(200).json({ attractions });
  } catch (error) {
    console.error('Error fetching pending attractions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Approve an Attraction (Admin Only)
exports.approveAttraction = async (req, res) => {
  try {
    const { id } = req.params;
    const attraction = await Attraction.findByPk(id);

    if (!attraction) {
      return res.status(404).json({ message: 'Attraction not found' });
    }

    if (attraction.status !== 'Pending') {
      return res.status(400).json({ message: 'Attraction is not pending approval.' });
    }

    attraction.status = 'Approved';
    await attraction.save();

    res.status(200).json({ message: 'Attraction approved successfully.', attraction });
  } catch (error) {
    console.error('Error approving attraction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reject an Attraction (Admin Only)
exports.rejectAttraction = async (req, res) => {
  try {
    const { id } = req.params;
    const attraction = await Attraction.findByPk(id);

    if (!attraction) {
      return res.status(404).json({ message: 'Attraction not found' });
    }

    if (attraction.status !== 'Pending') {
      return res.status(400).json({ message: 'Attraction is not pending approval.' });
    }

    attraction.status = 'Rejected';
    await attraction.save();

    res.status(200).json({ message: 'Attraction rejected successfully.', attraction });
  } catch (error) {
    console.error('Error rejecting attraction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Authenticated User's Attractions (Accessible by 'User', 'BusinessAdministrator', 'Admin')
exports.getUserAttractions = async (req, res) => {
  try {
    const FirebaseUID = req.user.uid; // Extracted from authentication middleware
    const attractions = await Attraction.findAll({ where: { FirebaseUID } });
    res.status(200).json({ attractions });
  } catch (error) {
    console.error('Error fetching user attractions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
