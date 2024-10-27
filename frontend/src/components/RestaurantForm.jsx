import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/RestaurantForm.css';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme CSS
import { format } from 'date-fns';

const RestaurantForm = () => {
  const { user } = useContext(AuthContext); // Access user from context
  const [restaurantDetails, setRestaurantDetails] = useState({
    name: '',
    location: '',
    cuisine: '',
    priceRange: '',
    rating: '',
    description: '',
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
    setRestaurantDetails({ ...restaurantDetails, [e.target.name]: e.target.value });
  };

  // Handle Amenity changes
  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    const newAmenities = checked
      ? [...restaurantDetails.amenities, value]
      : restaurantDetails.amenities.filter((amenity) => amenity !== value);
    setRestaurantDetails({ ...restaurantDetails, amenities: newAmenities });
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
        setError('Failed to process images.');
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

    // Convert availability array to JSON object
    const availabilityObj = {};
    availability.forEach((date) => {
      availabilityObj[date] = true; // Mark as available
    });

    // Construct the payload
    const payload = {
      name: restaurantDetails.name,
      location: restaurantDetails.location,
      cuisine: restaurantDetails.cuisine,
      priceRange: restaurantDetails.priceRange,
      rating: restaurantDetails.rating,
      description: restaurantDetails.description,
      amenities: JSON.stringify(restaurantDetails.amenities),
      images: images, // Array of Base64 strings
      availability: availabilityObj, // Date-wise availability
    };

    try {
      if (!user) {
        setError('Authentication required. Please log in.');
        return;
      }

      const idToken = await user.getIdToken();

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

      const response = await axios.post(`${backendUrl}/api/restaurants`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`, // Include the token
        },
      });

      setMessage(response.data.message);
      // Reset form fields
      setRestaurantDetails({
        name: '',
        location: '',
        cuisine: '',
        priceRange: '',
        rating: '',
        description: '',
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
      console.error('Error submitting restaurant:', err);
      if (err.response && err.response.data) {
        // Display validation errors
        if (err.response.data.errors) {
          const validationErrors = err.response.data.errors.map((error) => error.msg).join(' | ');
          setError(validationErrors);
        } else {
          setError(err.response.data.message || 'Failed to submit restaurant');
        }
      } else {
        setError('Failed to submit restaurant');
      }
    }
  };

  return (
    <form className="restaurant-form" onSubmit={handleSubmit}>
      <h2>Add New Restaurant</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <input
        type="text"
        name="name"
        placeholder="Restaurant Name"
        value={restaurantDetails.name}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="location"
        placeholder="Location"
        value={restaurantDetails.location}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="cuisine"
        placeholder="Cuisine"
        value={restaurantDetails.cuisine}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="priceRange"
        placeholder="Price Range ($)"
        value={restaurantDetails.priceRange}
        onChange={handleChange}
        min="1"
        max="5"
        required
      />

      <input
        type="number"
        name="rating"
        placeholder="Rating (1-5)"
        value={restaurantDetails.rating}
        onChange={handleChange}
        min="1"
        max="5"
        step="0.1"
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={restaurantDetails.description}
        onChange={handleChange}
        required
      />

      {/* Amenities */}
      <div className="amenities">
        <h3>Amenities</h3>
        <label>
          <input
            type="checkbox"
            value="WiFi"
            onChange={handleAmenityChange}
            checked={restaurantDetails.amenities.includes('WiFi')}
          />
          WiFi
        </label>
        <label>
          <input
            type="checkbox"
            value="Outdoor Seating"
            onChange={handleAmenityChange}
            checked={restaurantDetails.amenities.includes('Outdoor Seating')}
          />
          Outdoor Seating
        </label>
        <label>
          <input
            type="checkbox"
            value="Live Music"
            onChange={handleAmenityChange}
            checked={restaurantDetails.amenities.includes('Live Music')}
          />
          Live Music
        </label>
        <label>
          <input
            type="checkbox"
            value="Pet-Friendly"
            onChange={handleAmenityChange}
            checked={restaurantDetails.amenities.includes('Pet-Friendly')}
          />
          Pet-Friendly
        </label>
        <label>
          <input
            type="checkbox"
            value="Vegetarian Options"
            onChange={handleAmenityChange}
            checked={restaurantDetails.amenities.includes('Vegetarian Options')}
          />
          Vegetarian Options
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
        <h3>Restaurant Images</h3>
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
        {images.length > 0 && (
          <div className="image-previews">
            {images.map((base64, index) => (
              <img
                key={index}
                src={base64}
                alt={`Restaurant Image ${index + 1}`}
                className="preview-image"
              />
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="submit-button">
        Add Restaurant
      </button>
    </form>
  );
};

export default RestaurantForm;
