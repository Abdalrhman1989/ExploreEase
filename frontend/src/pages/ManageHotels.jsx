// src/pages/ManageHotels.jsx

import React, { useEffect, useState, useContext } from 'react'; // Single React import
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/ManageHotels.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageHotels = () => {
  const { idToken, isAuthenticated, userRole } = useContext(AuthContext);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: '',
    basePrice: '',
    rating: '',
    description: '',
    amenities: [],
    images: [],
    availability: {}, // Initialize availability as an empty object
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Fetch hotels when authenticated
  useEffect(() => {
    if (isAuthenticated && idToken) {
      fetchHotels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, idToken]);

  // Fetch hotels from backend
  const fetchHotels = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      let url = '';

      if (userRole === 'Admin') {
        url = `${backendUrl}/api/hotels/pending`; // Fetch pending hotels for Admin
      } else {
        url = `${backendUrl}/api/hotels/user`; // Fetch user's approved hotels
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setHotels(response.data.hotels);
      console.log('Fetched Hotels:', response.data.hotels); // Debugging line
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Failed to fetch hotels.');
      toast.error('Failed to fetch hotels.');
    }
  };

  // Handle search
  const filteredHotels = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Delete
  const handleDelete = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      await axios.delete(`${backendUrl}/api/hotels/${hotelId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setHotels(hotels.filter((hotel) => hotel.HotelID !== hotelId));
      toast.success('Hotel deleted successfully!');
    } catch (err) {
      console.error('Error deleting hotel:', err);
      toast.error('Failed to delete hotel.');
    }
  };

  // Handle Select for View/Edit
  const handleSelect = (hotel) => {
    if (selectedHotel && selectedHotel.HotelID === hotel.HotelID && !isEditing) {
      // Toggle off selection if already selected and not editing
      setSelectedHotel(null);
      setIsEditing(false);
    } else {
      setSelectedHotel(hotel);
      setFormData({
        name: hotel.name || '',
        location: hotel.location || '',
        type: hotel.type || '',
        basePrice: hotel.basePrice || '',
        rating: hotel.rating || '',
        description: hotel.description || '',
        amenities: hotel.amenities || [],
        images: hotel.images || [],
        availability: hotel.availability || {}, // Ensure availability is an object
      });
      setIsEditing(false);
    }
  };

  // Handle Edit Toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Handle Form Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Amenity Changes
  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    const newAmenities = checked
      ? [...formData.amenities, value]
      : formData.amenities.filter((amenity) => amenity !== value);
    setFormData({ ...formData, amenities: newAmenities });
  };

  // Handle Image Upload and Conversion to Base64
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    convertFilesToBase64(files)
      .then((base64Images) => {
        setFormData({ ...formData, images: [...formData.images, ...base64Images] });
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

  // Handle Form Submission for Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss(); // Dismiss existing toasts
    setError('');

    // Prepare payload
    const payload = {
      name: formData.name,
      location: formData.location,
      type: formData.type,
      basePrice: formData.basePrice,
      rating: parseFloat(formData.rating), // Ensure rating is a float
      description: formData.description,
      amenities: formData.amenities, // Assuming backend accepts array
      images: formData.images, // Array of Base64 strings
      // availability is optional; include it only if editing
      ...(isEditing && { availability: formData.availability }),
    };

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      await axios.put(`${backendUrl}/api/hotels/${selectedHotel.HotelID}`, payload, { // Use HotelID
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      toast.success('Hotel updated successfully!');
      // Refresh hotel list
      fetchHotels();
      // Reset selection
      setSelectedHotel(null);
      setFormData({
        name: '',
        location: '',
        type: '',
        basePrice: '',
        rating: '',
        description: '',
        amenities: [],
        images: [],
        availability: {},
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating hotel:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to update hotel.');
      } else {
        setError('Failed to update hotel.');
      }
      toast.error(error || 'Failed to update hotel.');
    }
  };

  return (
    <div className="manage-hotels-container">
      <h2>Manage Hotels</h2>
      <div className="manage-hotels-header">
        <input
          type="text"
          placeholder="Search by name, location, or type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="manage-hotels-search"
        />
        <Link to="/business/hotels/add" className="manage-hotels-add-button">
          <i className="fas fa-plus"></i> Add New Hotel
        </Link>
      </div>

      {/* Listings Table */}
      <table className="manage-hotels-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <tr key={hotel.HotelID}>
                <td data-label="Name">{hotel.name}</td>
                <td data-label="Location">{hotel.location}</td>
                <td data-label="Type">{hotel.type}</td>
                <td data-label="Actions">
                  <button
                    onClick={() => handleSelect(hotel)}
                    className="manage-hotels-view-button"
                  >
                    {selectedHotel && selectedHotel.HotelID === hotel.HotelID && !isEditing
                      ? 'Hide'
                      : 'View/Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(hotel.HotelID)}
                    className="manage-hotels-delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No hotels found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* View/Edit Section */}
      {selectedHotel && (
        <div className="manage-hotels-view-edit-section">
          {!isEditing ? (
            <div className="hotel-details">
              <h3>{selectedHotel.name}</h3>
              <p>
                <strong>Location:</strong> {selectedHotel.location}
              </p>
              <p>
                <strong>Type:</strong> {selectedHotel.type}
              </p>
              <p>
                <strong>Base Price:</strong> ${selectedHotel.basePrice}
              </p>
              <p>
                <strong>Rating:</strong> {selectedHotel.rating}/5
              </p>
              <p>
                <strong>Description:</strong> {selectedHotel.description}
              </p>

              <h4>Amenities</h4>
              <ul>
                {selectedHotel.amenities.map((amenity, index) => (
                  <li key={index}>{amenity}</li>
                ))}
              </ul>

              <h4>Images</h4>
              <div className="hotel-images">
                {selectedHotel.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Hotel view ${index + 1}`}
                    className="hotel-image"
                  />
                ))}
              </div>

              <h4>Availability</h4>
              <ul>
                {Object.entries(selectedHotel.availability || {}).map(([date, isAvailable]) => (
                  <li key={date}>
                    {date}: {isAvailable ? 'Available' : 'Not Available'}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleEditToggle}
                className="manage-hotels-edit-toggle-button"
              >
                Edit Hotel
              </button>
            </div>
          ) : (
            <form
              className="manage-hotels-edit-form"
              onSubmit={handleSubmit}
            >
              <h3>Edit Hotel</h3>
              {error && <p className="error-message">{error}</p>}

              <input
                type="text"
                name="name"
                placeholder="Hotel Name"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location || ''}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="type"
                placeholder="Type"
                value={formData.type || ''}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="basePrice"
                placeholder="Base Price ($)"
                value={formData.basePrice || ''}
                onChange={handleChange}
                min="0"
                required
              />

              <input
                type="number"
                name="rating"
                placeholder="Rating (1-5)"
                value={formData.rating || ''}
                onChange={handleChange}
                min="1"
                max="5"
                step="0.1"
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description || ''}
                onChange={handleChange}
                required
              />

              {/* Amenities */}
              <div className="manage-hotels-amenities">
                <h4>Amenities</h4>
                <label>
                  <input
                    type="checkbox"
                    value="Free WiFi"
                    onChange={handleAmenityChange}
                    checked={formData.amenities.includes('Free WiFi')}
                  />
                  Free WiFi
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Swimming Pool"
                    onChange={handleAmenityChange}
                    checked={formData.amenities.includes('Swimming Pool')}
                  />
                  Swimming Pool
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Gym"
                    onChange={handleAmenityChange}
                    checked={formData.amenities.includes('Gym')}
                  />
                  Gym
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Spa"
                    onChange={handleAmenityChange}
                    checked={formData.amenities.includes('Spa')}
                  />
                  Spa
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Restaurant"
                    onChange={handleAmenityChange}
                    checked={formData.amenities.includes('Restaurant')}
                  />
                  Restaurant
                </label>
                {/* Add more amenities as needed */}
              </div>

              {/* Image Upload */}
              <div className="manage-hotels-image-upload">
                <h4>Hotel Images</h4>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
                {formData.images.length > 0 && (
                  <div className="manage-hotels-image-previews">
                    {formData.images.map((base64, index) => (
                      <img
                        key={index}
                        src={base64}
                        alt={`Hotel view ${index + 1}`}
                        className="manage-hotels-preview-image"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="manage-hotels-availability">
                <h4>Availability</h4>
                {/* Simple example: Allow adding dates and their availability */}
                {/* For a production app, consider using a date picker or calendar component */}
                <div className="availability-fields">
                  <input
                    type="date"
                    name="availabilityDate"
                    placeholder="Select Date"
                    id="availabilityDate"
                  />
                  <select
                    name="availabilityStatus"
                    id="availabilityStatus"
                    onChange={(e) => {
                      const date = document.getElementById('availabilityDate').value;
                      const status = e.target.value === 'true';
                      if (date) {
                        setFormData({
                          ...formData,
                          availability: {
                            ...formData.availability,
                            [date]: status,
                          },
                        });
                      }
                    }}
                  >
                    <option value="">Select Availability</option>
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                </div>
                {/* Display current availability */}
                <ul>
                  {Object.entries(formData.availability || {}).map(([date, isAvailable]) => (
                    <li key={date}>
                      {date}: {isAvailable ? 'Available' : 'Not Available'}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="submit"
                className="manage-hotels-submit-button"
              >
                Update Hotel
              </button>
            </form>
          )}

          <ToastContainer />
        </div>
      )}
    </div>
  );
};

export default ManageHotels;
