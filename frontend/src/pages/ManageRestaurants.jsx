// src/components/ManageRestaurants.jsx

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/ManageRestaurants.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageRestaurants = () => {
  const { idToken, isAuthenticated, userRole } = useContext(AuthContext);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    cuisine: '',
    priceRange: '',
    rating: '',
    description: '',
    amenities: [],
    images: [],
    status: '', // To display current status
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Fetch restaurants when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchRestaurants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Fetch all restaurants if Admin, else fetch user's restaurants
  const fetchRestaurants = async () => {
    if (!idToken) {
      console.warn('ID token is not available yet.');
      return;
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      let url = '';

      if (userRole === 'Admin') {
        url = `${backendUrl}/api/restaurants`;
      } else {
        url = `${backendUrl}/api/restaurants/user`;
      }

      console.log("Fetching from URL:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setRestaurants(response.data.restaurants);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('Failed to fetch restaurants.');
      toast.error('Failed to fetch restaurants.');
    }
  };

  // Handle search
  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Delete
  const handleDelete = async (restaurantId) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) return;

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      await axios.delete(`${backendUrl}/api/restaurants/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setRestaurants(restaurants.filter((restaurant) => restaurant.RestaurantID !== restaurantId));
      toast.success('Restaurant deleted successfully!');
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          const validationErrors = err.response.data.errors.map(e => e.msg).join(', ');
          setError(validationErrors);
          toast.error(validationErrors);
        } else {
          setError(err.response.data.message || 'Failed to delete restaurant.');
          toast.error(err.response.data.message || 'Failed to delete restaurant.');
        }
      } else {
        setError('Failed to delete restaurant.');
        toast.error('Failed to delete restaurant.');
      }
    }
  };

  // Handle Select for View/Edit
  const handleSelect = (restaurant) => {
    if (selectedRestaurant && selectedRestaurant.RestaurantID === restaurant.RestaurantID && !isEditing) {
      // Toggle off selection if already selected and not editing
      setSelectedRestaurant(null);
      setIsEditing(false);
    } else {
      setSelectedRestaurant(restaurant);
      setFormData({
        name: restaurant.name,
        location: restaurant.location,
        cuisine: restaurant.cuisine,
        priceRange: restaurant.priceRange,
        rating: restaurant.rating,
        description: restaurant.description,
        amenities: restaurant.amenities, // Assuming amenities is already an array
        images: restaurant.images,
        status: restaurant.status, // Display current status
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
      cuisine: formData.cuisine,
      priceRange: formData.priceRange,
      rating: formData.rating,
      description: formData.description,
      amenities: formData.amenities, // Send as array, not JSON string
      images: formData.images, // Array of Base64 strings
      // availability is optional and handled separately
    };

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      await axios.put(`${backendUrl}/api/restaurants/${selectedRestaurant.RestaurantID}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      toast.success('Restaurant updated successfully!');
      // Refresh restaurant list
      fetchRestaurants();
      // Reset selection
      setSelectedRestaurant(null);
      setFormData({
        name: '',
        location: '',
        cuisine: '',
        priceRange: '',
        rating: '',
        description: '',
        amenities: [],
        images: [],
        status: '',
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating restaurant:', err);
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          const validationErrors = err.response.data.errors.map(e => e.msg).join(', ');
          setError(validationErrors);
          toast.error(validationErrors);
        } else {
          setError(err.response.data.message || 'Failed to update restaurant.');
          toast.error(err.response.data.message || 'Failed to update restaurant.');
        }
      } else {
        setError('Failed to update restaurant.');
        toast.error('Failed to update restaurant.');
      }
    }
  };

  return (
    <div className="manage-restaurants-container">
      <h2>Manage Restaurants</h2>
      <div className="manage-restaurants-header">
        <input
          type="text"
          placeholder="Search by name, location, or cuisine"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="manage-restaurants-search"
        />
        <Link to="/business/restaurants/add" className="manage-restaurants-add-button">
          <i className="fas fa-plus"></i> Add New Restaurant
        </Link>
      </div>

      {/* Listings Table */}
      <table className="manage-restaurants-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Cuisine</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((restaurant) => (
              <tr key={restaurant.RestaurantID}>
                <td data-label="Name">{restaurant.name}</td>
                <td data-label="Location">{restaurant.location}</td>
                <td data-label="Cuisine">{restaurant.cuisine}</td>
                <td data-label="Status">{restaurant.status}</td>
                <td data-label="Actions">
                  <button
                    onClick={() => handleSelect(restaurant)}
                    className="manage-restaurants-view-button"
                  >
                    {selectedRestaurant && selectedRestaurant.RestaurantID === restaurant.RestaurantID && !isEditing
                      ? 'Hide'
                      : 'View/Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(restaurant.RestaurantID)}
                    className="manage-restaurants-delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No restaurants found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* View/Edit Section */}
      {selectedRestaurant && (
        <div className="manage-restaurants-view-edit-section">
          {!isEditing ? (
            <div className="restaurant-details">
              <h3>{selectedRestaurant.name}</h3>
              <p>
                <strong>Location:</strong> {selectedRestaurant.location}
              </p>
              <p>
                <strong>Cuisine:</strong> {selectedRestaurant.cuisine}
              </p>
              <p>
                <strong>Price Range:</strong> {'$'.repeat(selectedRestaurant.priceRange)}
              </p>
              <p>
                <strong>Rating:</strong> {selectedRestaurant.rating}/5
              </p>
              <p>
                <strong>Description:</strong> {selectedRestaurant.description}
              </p>
              <p>
                <strong>Status:</strong> <span className={`status ${selectedRestaurant.status.toLowerCase()}`}>{selectedRestaurant.status}</span>
              </p>

              <h4>Amenities</h4>
              <ul>
                {selectedRestaurant.amenities.map((amenity, index) => (
                  <li key={index}>{amenity}</li>
                ))}
              </ul>

              <h4>Images</h4>
              <div className="restaurant-images">
                {selectedRestaurant.images && selectedRestaurant.images.length > 0 ? (
                  selectedRestaurant.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Restaurant view ${index + 1}`}
                      className="restaurant-image"
                    />
                  ))
                ) : (
                  <p>No images available.</p>
                )}
              </div>

              <button
                onClick={handleEditToggle}
                className="manage-restaurants-edit-toggle-button"
              >
                Edit Restaurant
              </button>
            </div>
          ) : (
            <form
              className="manage-restaurants-edit-form"
              onSubmit={handleSubmit}
            >
              <h3>Edit Restaurant</h3>
              {error && <p className="error-message">{error}</p>}

              <input
                type="text"
                name="name"
                placeholder="Restaurant Name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="cuisine"
                placeholder="Cuisine"
                value={formData.cuisine}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="priceRange"
                placeholder="Price Range ($)"
                value={formData.priceRange}
                onChange={handleChange}
                min="1"
                max="5"
                required
              />

              <input
                type="number"
                name="rating"
                placeholder="Rating (1-5)"
                value={formData.rating}
                onChange={handleChange}
                min="1"
                max="5"
                step="0.1"
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
              />

              {/* Amenities */}
              <div className="manage-restaurants-amenities">
                <h4>Amenities</h4>
                <label>
                  <input
                    type="checkbox"
                    value="WiFi"
                    onChange={handleAmenityChange}
                    checked={formData.amenities.includes('WiFi')}
                  />
                  WiFi
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Outdoor Seating"
                    onChange={handleAmenityChange}
                    checked={formData.amenities.includes('Outdoor Seating')}
                  />
                  Outdoor Seating
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Live Music"
                    onChange={handleAmenityChange}
                    checked={formData.amenities.includes('Live Music')}
                  />
                  Live Music
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Pet-Friendly"
                    onChange={handleAmenityChange}
                    checked={formData.amenities.includes('Pet-Friendly')}
                  />
                  Pet-Friendly
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Vegetarian Options"
                    onChange={handleAmenityChange}
                    checked={formData.amenities.includes('Vegetarian Options')}
                  />
                  Vegetarian Options
                </label>
                {/* Add more amenities as needed */}
              </div>

              {/* Image Upload */}
              <div className="manage-restaurants-image-upload">
                <h4>Restaurant Images</h4>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
                {formData.images.length > 0 && (
                  <div className="manage-restaurants-image-previews">
                    {formData.images.map((base64, index) => (
                      <img
                        key={index}
                        src={base64}
                        alt={`Restaurant view ${index + 1}`}
                        className="manage-restaurants-preview-image"
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="manage-restaurants-submit-button"
              >
                Update Restaurant
              </button>
            </form>
          )}

          <ToastContainer />
        </div>
      )}
    </div>
  );
};

export default ManageRestaurants;
