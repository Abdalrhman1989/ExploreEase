const { validationResult } = require('express-validator');
const { Restaurant } = require('../models');
const { Op } = require('sequelize');

// Create a new restaurant
const createRestaurant = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      name,
      location,
      cuisine,
      priceRange,
      rating,
      description,
      amenities, 
      images, 
      availability, 
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

    // Create new restaurant with status 'Pending'
    const newRestaurant = await Restaurant.create({
      FirebaseUID: req.user.uid,
      name,
      location,
      cuisine,
      priceRange,
      rating,
      description,
      amenities: amenities || [],
      images: processedImages,
      status: 'Pending',
      availability: processedAvailability, 
    });

    res.status(201).json({
      success: true,
      message: 'Restaurant submitted successfully and is pending approval.',
      restaurant: newRestaurant,
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get approved restaurants
const getApprovedRestaurants = async (req, res) => {
  try {
    const { location, cuisine, page = 1, limit = 100 } = req.query;
    let whereClause = { status: 'Approved' };

    if (location) {
      // Replace Op.iLike with Op.like for MySQL compatibility
      whereClause.location = { [Op.like]: `%${location}%` };
    }

    if (cuisine) {
      whereClause.cuisine = { [Op.like]: `%${cuisine}%` };
    }

    // Implement pagination
    const offset = (page - 1) * limit;

    const restaurants = await Restaurant.findAndCountAll({
      where: whereClause,
      attributes: [
        'RestaurantID',
        'name',
        'location',
        'cuisine',
        'priceRange',
        'rating',
        'description',
        'amenities',
        'images',
        'availability',
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']], 
    });

    res.status(200).json({ 
      success: true, 
      restaurants: restaurants.rows,
      total: restaurants.count,
      page: parseInt(page),
      totalPages: Math.ceil(restaurants.count / limit),
    });
  } catch (error) {
    console.error('Error fetching approved restaurants:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get all restaurants (Admin Only)
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: {},
      attributes: [
        'RestaurantID',
        'FirebaseUID',
        'name',
        'location',
        'cuisine',
        'priceRange',
        'rating',
        'description',
        'amenities',
        'images',
        'availability',
        'status',
        'createdAt',
        'updatedAt',
      ],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ success: true, restaurants });
  } catch (error) {
    console.error('Error fetching all restaurants:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get pending restaurants (Admin Only)
const getPendingRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({ where: { status: 'Pending' } });
    res.status(200).json({ success: true, restaurants });
  } catch (error) {
    console.error('Error fetching pending restaurants:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Approve a restaurant (Admin Only)
const approveRestaurant = async (req, res) => {
  const restaurantId = req.params.id;

  try {
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    if (restaurant.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot approve a restaurant with status ${restaurant.status}` });
    }

    restaurant.status = 'Approved';
    await restaurant.save();

    res.status(200).json({ success: true, message: 'Restaurant approved successfully', restaurant });
  } catch (error) {
    console.error('Error approving restaurant:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Reject a restaurant (Admin Only)
const rejectRestaurant = async (req, res) => {
  const restaurantId = req.params.id;

  try {
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    if (restaurant.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot reject a restaurant with status ${restaurant.status}` });
    }

    restaurant.status = 'Rejected';
    await restaurant.save();

    res.status(200).json({ success: true, message: 'Restaurant rejected successfully', restaurant });
  } catch (error) {
    console.error('Error rejecting restaurant:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get a single restaurant by ID
const getRestaurantById = async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findOne({
      where: { RestaurantID: id, status: 'Approved' },
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    }

    res.status(200).json({ success: true, restaurant });
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Update restaurant availability
const updateRestaurantAvailability = async (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;

  // Validate availability is an object with date keys
  if (typeof availability !== 'object' || Array.isArray(availability)) {
    return res.status(400).json({ success: false, message: 'Availability must be an object with date keys' });
  }

  try {
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    restaurant.availability = availability;
    await restaurant.save();

    res.status(200).json({ success: true, message: 'Availability updated successfully', restaurant });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get user's restaurants
const getUserRestaurants = async (req, res) => {
  try {
    const userUid = req.user.uid;
    const restaurants = await Restaurant.findAll({ where: { FirebaseUID: userUid } });
    res.status(200).json({ success: true, restaurants });
  } catch (error) {
    console.error('Error fetching user restaurants:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Delete a restaurant
const deleteRestaurant = async (req, res) => {
  const restaurantId = req.params.id;

  try {
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    if (req.user.role !== 'Admin' && restaurant.FirebaseUID !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot delete this restaurant' });
    }

    await restaurant.destroy();

    res.status(200).json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Update a restaurant's details
const updateRestaurant = async (req, res) => {
  const restaurantId = req.params.id;

  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    if (req.user.role !== 'Admin' && restaurant.FirebaseUID !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot update this restaurant' });
    }

    const {
      name,
      location,
      cuisine,
      priceRange,
      rating,
      description,
      amenities,
      images, 
      availability,
    } = req.body;

    // Validate and process images
    let processedImages = restaurant.images; 
    if (images && Array.isArray(images)) {
      processedImages = images.map((base64String) => {
        // Validate the Base64 string format
        if (!base64String.startsWith('data:image/')) {
          throw new Error('Invalid image format. Images must be Base64 encoded strings starting with "data:image/".');
        }
        return base64String;
      });
    }

    // Validate availability if provided
    let processedAvailability = restaurant.availability;
    if (availability && typeof availability === 'object' && !Array.isArray(availability)) {
      processedAvailability = {};
      for (const [date, isAvailable] of Object.entries(availability)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD.`);
        }
        if (typeof isAvailable !== 'boolean') {
          throw new Error(`Invalid availability value for ${date}. Expected boolean.`);
        }
        processedAvailability[date] = isAvailable;
      }
    }

    // Update restaurant details
    restaurant.name = name || restaurant.name;
    restaurant.location = location || restaurant.location;
    restaurant.cuisine = cuisine || restaurant.cuisine;
    restaurant.priceRange = priceRange || restaurant.priceRange;
    restaurant.rating = rating || restaurant.rating;
    restaurant.description = description || restaurant.description;
    restaurant.amenities = amenities || restaurant.amenities; 
    restaurant.images = processedImages;
    restaurant.availability = processedAvailability;

    // If not Admin, set status back to 'Pending' for re-approval
    if (req.user.role !== 'Admin') {
      restaurant.status = 'Pending';
    }

    await restaurant.save();

    res.status(200).json({ success: true, message: 'Restaurant updated successfully', restaurant });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  createRestaurant,
  getApprovedRestaurants,
  getAllRestaurants,
  getPendingRestaurants,
  approveRestaurant,
  rejectRestaurant,
  getRestaurantById,
  updateRestaurantAvailability,
  getUserRestaurants,
  deleteRestaurant,
  updateRestaurant,
};
