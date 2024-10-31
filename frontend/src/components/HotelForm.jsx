// src/components/HotelForm.jsx

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/HotelForm.css';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme CSS
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HotelForm = () => {
  const { user } = useContext(AuthContext); // Access user from context
  const [hotelDetails, setHotelDetails] = useState({
    name: '',
    location: '',
    basePrice: '',
    description: '',
    roomTypes: [{ type: '', price: '', availability: 'Available' }],
    seasonalPricing: [{ startDate: '', endDate: '', price: '' }],
    amenities: [],
  });
  const [images, setImages] = useState([]);
  const [availability, setAvailability] = useState([]); // Array of date strings
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  // Handle form field changes
  const handleChange = (e) => {
    setHotelDetails({ ...hotelDetails, [e.target.name]: e.target.value });
  };

  // Handle Room Type changes
  const handleRoomTypeChange = (index, e) => {
    const newRoomTypes = hotelDetails.roomTypes.map((roomType, i) =>
      index === i ? { ...roomType, [e.target.name]: e.target.value } : roomType
    );
    setHotelDetails({ ...hotelDetails, roomTypes: newRoomTypes });
  };

  // Add a new Room Type
  const addRoomType = () => {
    setHotelDetails({
      ...hotelDetails,
      roomTypes: [...hotelDetails.roomTypes, { type: '', price: '', availability: 'Available' }],
    });
  };

  // Handle Seasonal Pricing changes
  const handleSeasonalPricingChange = (index, e) => {
    const newSeasonalPricing = hotelDetails.seasonalPricing.map((season, i) =>
      index === i ? { ...season, [e.target.name]: e.target.value } : season
    );
    setHotelDetails({ ...hotelDetails, seasonalPricing: newSeasonalPricing });
  };

  // Add a new Seasonal Pricing
  const addSeasonalPricing = () => {
    setHotelDetails({
      ...hotelDetails,
      seasonalPricing: [...hotelDetails.seasonalPricing, { startDate: '', endDate: '', price: '' }],
    });
  };

  // Handle Amenity changes
  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    const newAmenities = checked
      ? [...hotelDetails.amenities, value]
      : hotelDetails.amenities.filter((amenity) => amenity !== value);
    setHotelDetails({ ...hotelDetails, amenities: newAmenities });
  };

  // Handle Image Upload and Conversion to Base64
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    convertFilesToBase64(files)
      .then((base64Images) => {
        setImages(base64Images);
      })
      .catch((err) => {
        console.error('Error converting images:', err);
        toast.error('Failed to process images.');
      });
  };

  // Utility function to convert files to Base64
  const convertFilesToBase64 = (files) => {
    return Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      })
    );
  };

  // Handle Date Range Selection
  const handleSelect = (ranges) => {
    const { selection } = ranges;
    setDateRange([selection]);

    const { startDate, endDate } = selection;

    // Generate all dates within the selected range
    const datesInRange = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      datesInRange.push(format(currentDate, 'yyyy-MM-dd'));
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    setAvailability(datesInRange);
  };

  // Remove a selected date
  const removeDate = (dateToRemove) => {
    setAvailability(availability.filter((date) => date !== dateToRemove));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    toast.dismiss(); // Dismiss existing toasts

    // Convert availability array to JSON object
    const availabilityObj = {};
    availability.forEach((date) => {
      availabilityObj[date] = true; // Mark as available
    });

    // Construct the payload
    const payload = {
      name: hotelDetails.name,
      location: hotelDetails.location,
      basePrice: hotelDetails.basePrice,
      description: hotelDetails.description,
      roomTypes: JSON.stringify(hotelDetails.roomTypes),
      seasonalPricing: JSON.stringify(hotelDetails.seasonalPricing),
      amenities: JSON.stringify(hotelDetails.amenities),
      images: images, // Array of Base64 strings
      availability: availabilityObj, // Date-wise availability
    };

    try {
      if (!user) {
        setError('Authentication required. Please log in.');
        toast.error('Authentication required. Please log in.');
        return;
      }

      const idToken = await user.getIdToken();

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

      const response = await axios.post(`${backendUrl}/api/hotels`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`, // Include the token
        },
      });

      setMessage(response.data.message);
      toast.success(response.data.message);
      // Reset form fields
      setHotelDetails({
        name: '',
        location: '',
        basePrice: '',
        description: '',
        roomTypes: [{ type: '', price: '', availability: 'Available' }],
        seasonalPricing: [{ startDate: '', endDate: '', price: '' }],
        amenities: [],
      });
      setImages([]);
      setAvailability([]);
      setDateRange([
        {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      ]);
    } catch (err) {
      console.error('Error submitting hotel:', err);
      if (err.response && err.response.data) {
        // Display validation errors
        if (err.response.data.errors) {
          const validationErrors = err.response.data.errors.map((error) => error.msg).join(' | ');
          setError(validationErrors);
          toast.error(validationErrors);
        } else {
          setError(err.response.data.message || 'Failed to submit hotel');
          toast.error(err.response.data.message || 'Failed to submit hotel');
        }
      } else {
        setError('Failed to submit hotel');
        toast.error('Failed to submit hotel');
      }
    }
  };

  return (
    <form className="hotel-form" onSubmit={handleSubmit}>
      <h2>Add New Hotel</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <input
        type="text"
        name="name"
        placeholder="Hotel Name"
        value={hotelDetails.name}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="location"
        placeholder="Location"
        value={hotelDetails.location}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="basePrice"
        placeholder="Base Price per Night"
        value={hotelDetails.basePrice}
        onChange={handleChange}
        min="0"
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={hotelDetails.description}
        onChange={handleChange}
        required
      />

      {/* Room Types */}
      <div className="room-types">
        <h3>Room Types</h3>
        {hotelDetails.roomTypes.map((roomType, index) => (
          <div key={index} className="room-type">
            <input
              type="text"
              name="type"
              placeholder="Room Type"
              value={roomType.type}
              onChange={(e) => handleRoomTypeChange(index, e)}
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Room Price per Night"
              value={roomType.price}
              onChange={(e) => handleRoomTypeChange(index, e)}
              required
            />
            <select
              name="availability"
              value={roomType.availability}
              onChange={(e) => handleRoomTypeChange(index, e)}
            >
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>
        ))}
        <button type="button" onClick={addRoomType} className="add-button">
          Add Another Room Type
        </button>
      </div>

      {/* Seasonal Pricing */}
      <div className="seasonal-pricing">
        <h3>Seasonal Pricing</h3>
        {hotelDetails.seasonalPricing.map((season, index) => (
          <div key={index} className="season">
            <input
              type="date"
              name="startDate"
              value={season.startDate}
              onChange={(e) => handleSeasonalPricingChange(index, e)}
              required
            />
            <input
              type="date"
              name="endDate"
              value={season.endDate}
              onChange={(e) => handleSeasonalPricingChange(index, e)}
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Seasonal Price per Night"
              value={season.price}
              onChange={(e) => handleSeasonalPricingChange(index, e)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addSeasonalPricing} className="add-button">
          Add Seasonal Pricing
        </button>
      </div>

      {/* Amenities */}
      <div className="amenities">
        <h3>Amenities</h3>
        <label>
          <input
            type="checkbox"
            value="WiFi"
            onChange={handleAmenityChange}
            checked={hotelDetails.amenities.includes('WiFi')}
          />
          WiFi
        </label>
        <label>
          <input
            type="checkbox"
            value="Swimming Pool"
            onChange={handleAmenityChange}
            checked={hotelDetails.amenities.includes('Swimming Pool')}
          />
          Swimming Pool
        </label>
        <label>
          <input
            type="checkbox"
            value="Parking"
            onChange={handleAmenityChange}
            checked={hotelDetails.amenities.includes('Parking')}
          />
          Parking
        </label>
        <label>
          <input
            type="checkbox"
            value="Gym"
            onChange={handleAmenityChange}
            checked={hotelDetails.amenities.includes('Gym')}
          />
          Gym
        </label>
        <label>
          <input
            type="checkbox"
            value="Spa"
            onChange={handleAmenityChange}
            checked={hotelDetails.amenities.includes('Spa')}
          />
          Spa
        </label>
        <label>
          <input
            type="checkbox"
            value="Bar"
            onChange={handleAmenityChange}
            checked={hotelDetails.amenities.includes('Bar')}
          />
          Bar
        </label>
        {/* Add more amenities as needed */}
      </div>

      {/* Availability */}
      <div className="availability">
        <h3>Availability Dates</h3>
        <DateRange
          editableDateInputs={true}
          onChange={handleSelect}
          moveRangeOnFirstSelection={false}
          ranges={dateRange}
          maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
          className="date-range-picker"
        />
        {availability.length > 0 && (
          <div className="selected-dates">
            <h4>Selected Dates:</h4>
            <ul>
              {availability.map((date, index) => (
                <li key={index}>
                  {date}
                  <button type="button" onClick={() => removeDate(date)} className="remove-date-button">
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Image Upload */}
      <div className="image-upload">
        <h3>Hotel Images</h3>
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
        {images.length > 0 && (
          <div className="image-previews">
            {images.map((base64, index) => (
              <img
                key={index}
                src={base64}
                alt={`Hotel Image ${index + 1}`}
                className="preview-image"
              />
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="submit-button">
        Add Hotel
      </button>

      <ToastContainer />
    </form>
  );
};

export default HotelForm;
