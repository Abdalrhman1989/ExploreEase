const { validationResult } = require('express-validator');
const { Hotel } = require('../models'); 

// Create a new hotel
const createHotel = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      name,
      location,
      city,
      basePrice,
      description,
      latitude,
      longitude,
      roomTypes,
      seasonalPricing,
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
          throw new Error(
            'Invalid image format. Images must be Base64 encoded strings starting with "data:image/".'
          );
        }
        return base64String;
      });
    }

    // Create the hotel
    const hotel = await Hotel.create({
      FirebaseUID: req.user.uid,
      name,
      location,
      city,
      basePrice,
      description,
      latitude,
      longitude,
      roomTypes,
      seasonalPricing,
      amenities,
      images: processedImages,
      availability,
      status: 'Pending',
    });

    res.status(201).json({ success: true, message: 'Hotel created successfully.', hotel });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get approved hotels
const getApprovedHotels = async (req, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.query;

    // Define whereClause to filter approved hotels
    const whereClause = { status: 'Approved' };

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInMeters = parseInt(radius, 10);

      if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusInMeters)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid latitude, longitude, or radius.' });
      }

      const sequelize = require('../models').sequelize;

      const hotels = await Hotel.findAll({
        where: whereClause,
        attributes: {
          include: [
            [
              sequelize.literal(`(
                6371000 * acos(
                  cos(radians(${latitude}))
                  * cos(radians(latitude))
                  * cos(radians(longitude) - radians(${longitude}))
                  + sin(radians(${latitude}))
                  * sin(radians(latitude))
                )
              )`),
              'distance',
            ],
          ],
        },
        having: sequelize.where(sequelize.col('distance'), '<=', radiusInMeters),
        order: [['distance', 'ASC']],
      });

      return res.status(200).json({ success: true, hotels });
    }

    // If no location filtering
    const hotels = await Hotel.findAll({ where: whereClause });
    res.status(200).json({ success: true, hotels });
  } catch (error) {
    console.error('Error fetching approved hotels:', error);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get pending hotels (Admin only)
const getPendingHotels = async (req, res) => {
  try {
    const hotels = await Hotel.findAll({
      where: { status: 'Pending' },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ success: true, hotels });
  } catch (error) {
    console.error('Error fetching pending hotels:', error);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Approve a hotel (Admin only)
const approveHotel = async (req, res) => {
  const hotelId = req.params.id;

  try {
    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    if (hotel.status !== 'Pending') {
      return res
        .status(400)
        .json({ success: false, message: `Cannot approve a hotel with status ${hotel.status}` });
    }

    hotel.status = 'Approved';
    await hotel.save();

    res.status(200).json({ success: true, message: 'Hotel approved successfully', hotel });
  } catch (error) {
    console.error('Error approving hotel:', error);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Reject a hotel (Admin only)
const rejectHotel = async (req, res) => {
  const hotelId = req.params.id;

  try {
    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    if (hotel.status !== 'Pending') {
      return res
        .status(400)
        .json({ success: false, message: `Cannot reject a hotel with status ${hotel.status}` });
    }

    hotel.status = 'Rejected';
    await hotel.save();

    res.status(200).json({ success: true, message: 'Hotel rejected successfully', hotel });
  } catch (error) {
    console.error('Error rejecting hotel:', error);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get a single hotel by ID (Approved only)
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
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Update hotel availability
const updateHotelAvailability = async (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;

  // Validate availability is an object with date keys
  if (typeof availability !== 'object' || Array.isArray(availability)) {
    return res
      .status(400)
      .json({ success: false, message: 'Availability must be an object with date keys' });
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
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get user's hotels
const getUserHotels = async (req, res) => {
  try {
    const userUid = req.user.uid;
    const hotels = await Hotel.findAll({
      where: { FirebaseUID: userUid },
      attributes: [
        'HotelID',
        'FirebaseUID',
        'name',
        'location',
        'basePrice',
        'description',
        'roomTypes',
        'seasonalPricing',
        'amenities',
        'images',
        'availability',
        'status',
        'createdAt',
        'updatedAt',
      ],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ success: true, hotels });
  } catch (error) {
    console.error('Error fetching user hotels:', error);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Update a hotel
const updateHotel = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const hotelId = req.params.id;

  try {
    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Check if the user is authorized to update the hotel
    if (hotel.FirebaseUID !== req.user.uid && !['Admin'].includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized to update this hotel.' });
    }

    const {
      name,
      location,
      city,
      basePrice,
      description,
      latitude,
      longitude,
      roomTypes,
      seasonalPricing,
      amenities,
      images,
      availability,
      status,
    } = req.body;

    // Validate and process images
    let processedImages = hotel.images;
    if (images && Array.isArray(images)) {
      processedImages = images.map((base64String) => {
        // Validate the Base64 string format
        if (!base64String.startsWith('data:image/')) {
          throw new Error(
            'Invalid image format. Images must be Base64 encoded strings starting with "data:image/".'
          );
        }
        return base64String;
      });
    }

    // Validate roomTypes
    let processedRoomTypes = hotel.roomTypes;
    if (roomTypes && Array.isArray(roomTypes)) {
      processedRoomTypes = roomTypes;
    }

    // Validate seasonalPricing
    let processedSeasonalPricing = hotel.seasonalPricing;
    if (seasonalPricing && Array.isArray(seasonalPricing)) {
      processedSeasonalPricing = seasonalPricing;
    }

    // Validate amenities
    let processedAmenities = hotel.amenities;
    if (amenities && Array.isArray(amenities)) {
      processedAmenities = amenities;
    }

    // Validate availability
    let processedAvailability = hotel.availability;
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

    // Update hotel details
    hotel.name = name || hotel.name;
    hotel.location = location || hotel.location;
    hotel.city = city || hotel.city;
    hotel.basePrice = basePrice || hotel.basePrice;
    hotel.description = description || hotel.description;
    hotel.latitude = latitude || hotel.latitude;
    hotel.longitude = longitude || hotel.longitude;
    hotel.roomTypes = processedRoomTypes;
    hotel.seasonalPricing = processedSeasonalPricing;
    hotel.amenities = processedAmenities;
    hotel.images = processedImages.length > 0 ? processedImages : hotel.images;
    hotel.availability = processedAvailability;
    if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
      hotel.status = status;
    }

    await hotel.save();

    res.status(200).json({ success: true, message: 'Hotel updated successfully.', hotel });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Delete a hotel by ID
const deleteHotel = async (req, res) => {
  const hotelId = req.params.id;

  try {
    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    // Check if the user is authorized to delete the hotel
    if (hotel.FirebaseUID !== req.user.uid && !['Admin'].includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized to delete this hotel.' });
    }

    await hotel.destroy();

    res.status(200).json({ success: true, message: 'Hotel deleted successfully.' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: error.message });
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
  updateHotel,
  deleteHotel,
};
