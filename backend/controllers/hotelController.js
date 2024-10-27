// backend/controllers/hotelController.js

const { validationResult } = require('express-validator');
const { Hotel } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new hotel submission
 */
const createHotel = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      name,
      location,
      basePrice,
      description,
      roomTypes,
      seasonalPricing,
      amenities,
      images, // Expecting an array of Base64 strings
      availability, // Date-wise availability
    } = req.body;

    // Validate and process images
    let processedImages = [];
    if (images && Array.isArray(images)) {
      processedImages = images.map((base64String) => {
        // Validate the Base64 string format
        if (!base64String.startsWith('data:image/')) {
          throw new Error('Invalid image format. Images must be Base64 encoded strings starting with "data:image/".');
        }
        return base64String;
      });
    }

    // Validate availability
    let processedAvailability = {};
    if (availability && typeof availability === 'object' && !Array.isArray(availability)) {
      for (const [date, isAvailable] of Object.entries(availability)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD.`);
        }
        if (typeof isAvailable !== 'boolean') {
          throw new Error(`Invalid availability value for ${date}. Expected boolean.`);
        }
        processedAvailability[date] = isAvailable;
      }
    } else {
      throw new Error('Availability must be an object with date keys in YYYY-MM-DD format and boolean values.');
    }

    // Create new hotel with status 'Pending'
    const newHotel = await Hotel.create({
      FirebaseUID: req.user.uid,
      name,
      location,
      basePrice,
      description,
      roomTypes: roomTypes ? JSON.parse(roomTypes) : [],
      seasonalPricing: seasonalPricing ? JSON.parse(seasonalPricing) : [],
      amenities: amenities ? JSON.parse(amenities) : [],
      images: processedImages,
      status: 'Pending',
      availability: processedAvailability, // Set availability from request
    });

    res.status(201).json({
      success: true,
      message: 'Hotel submitted successfully and is pending approval.',
      hotel: newHotel,
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Get approved hotels, optionally filtered by location
 */
const getApprovedHotels = async (req, res) => {
  try {
    const { location } = req.query; // Get location from query params
    let whereClause = { status: 'Approved' };

    if (location) {
      whereClause.location = { [Op.iLike]: `%${location}%` }; // Case-insensitive partial match
    }

    const hotels = await Hotel.findAll({ where: whereClause });
    res.status(200).json({ success: true, hotels });
  } catch (error) {
    console.error('Error fetching approved hotels:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Get pending hotels
 */
const getPendingHotels = async (req, res) => {
  try {
    const hotels = await Hotel.findAll({ where: { status: 'Pending' } });
    res.status(200).json({ success: true, hotels });
  } catch (error) {
    console.error('Error fetching pending hotels:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Approve a hotel
 */
const approveHotel = async (req, res) => {
  const hotelId = req.params.id;

  try {
    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    if (hotel.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot approve a hotel with status ${hotel.status}` });
    }

    hotel.status = 'Approved';
    await hotel.save();

    res.status(200).json({ success: true, message: 'Hotel approved successfully', hotel });
  } catch (error) {
    console.error('Error approving hotel:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Reject a hotel
 */
const rejectHotel = async (req, res) => {
  const hotelId = req.params.id;

  try {
    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    if (hotel.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot reject a hotel with status ${hotel.status}` });
    }

    hotel.status = 'Rejected';
    await hotel.save();

    res.status(200).json({ success: true, message: 'Hotel rejected successfully', hotel });
  } catch (error) {
    console.error('Error rejecting hotel:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Get a single hotel by ID (Approved only)
 */
const getHotelById = async (req, res) => {
  const { id } = req.params;
  try {
    const hotel = await Hotel.findOne({
      where: { HotelID: id, status: 'Approved' },
    });

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    res.status(200).json({ success: true, hotel });
  } catch (error) {
    console.error('Error fetching hotel by ID:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Update hotel availability (Admin Only)
 */
const updateHotelAvailability = async (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;

  // Validate availability is an object with date keys
  if (typeof availability !== 'object' || Array.isArray(availability)) {
    return res.status(400).json({ success: false, message: 'Availability must be an object with date keys' });
  }

  try {
    const hotel = await Hotel.findByPk(id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    hotel.availability = availability;
    await hotel.save();

    res.status(200).json({ success: true, message: 'Availability updated successfully', hotel });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Get authenticated user's hotels (Approved only)
 */
const getUserHotels = async (req, res) => {
  try {
    const userUid = req.user.uid;
    const hotels = await Hotel.findAll({ where: { FirebaseUID: userUid, status: 'Approved' } });
    res.status(200).json({ success: true, hotels });
  } catch (error) {
    console.error('Error fetching user hotels:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  createHotel,
  getApprovedHotels,
  getPendingHotels,
  approveHotel,
  rejectHotel,
  getHotelById,
  updateHotelAvailability,
  getUserHotels,
};
