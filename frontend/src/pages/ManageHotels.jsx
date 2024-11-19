import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/ManageHotels.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
} from '@react-google-maps/api';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const defaultCenter = {
  lat: 48.8566, 
  lng: 2.3522,
};

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const ManageHotels = () => {
  const { idToken, isAuthenticated, userRole, user, loading } = useContext(AuthContext);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: '', // Added city field
    type: '',
    basePrice: '',
    rating: '',
    description: '',
    amenities: [],
    images: [],
    availability: {},
    latitude: '',
    longitude: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // **Initialize Missing State Variables**
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

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
        url = `${backendUrl}/api/hotels/pending`;
      } else {
        url = `${backendUrl}/api/hotels/user`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setHotels(response.data.hotels);
      console.log('Fetched Hotels:', response.data.hotels); 
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
        city: hotel.city || '', // Populate city
        type: hotel.type || '',
        basePrice: hotel.basePrice || '',
        rating: hotel.rating || '',
        description: hotel.description || '',
        amenities: hotel.amenities || [],
        images: hotel.images || [],
        availability: hotel.availability || {},
        latitude: hotel.latitude || '',
        longitude: hotel.longitude || '',
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

  // Handle Place Selection from Autocomplete
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const addressComponents = place.address_components;
      let city = '';

      // Extract city from address components
      for (const component of addressComponents) {
        if (component.types.includes('locality')) {
          city = component.long_name;
          break;
        }
      }

      setFormData({
        ...formData,
        location: place.formatted_address || place.name || '',
        city: city, // Set the city
        latitude: lat,
        longitude: lng,
      });
      setMarkerPosition({ lat, lng });
      setMapCenter({ lat, lng }); 
    } else {
      toast.error('No details available for the selected location.');
    }
  };

  // Reverse Geocoding: Get address from coordinates (Optional)
  const reverseGeocode = async (lat, lng) => {
    try {
      const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          latlng: `${lat},${lng}`,
          key: GOOGLE_MAPS_API_KEY,
        },
      });

      if (geocodeResponse.data.status === 'OK') {
        const address = geocodeResponse.data.results[0]?.formatted_address || '';
        // Extract city from address components
        const addressComponents = geocodeResponse.data.results[0]?.address_components || [];
        let city = '';
        for (const component of addressComponents) {
          if (component.types.includes('locality')) {
            city = component.long_name;
            break;
          }
        }

        setFormData((prevFormData) => ({
          ...prevFormData,
          location: address,
          city: city, // Set the city
        }));
      } else {
        toast.error('Failed to retrieve address from coordinates.');
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      toast.error('Error retrieving address from coordinates.');
    }
  };

  // Handle Map Click to set marker position
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    setFormData({ 
      ...formData, 
      latitude: lat, 
      longitude: lng 
    });
    // Optionally, reverse geocode to get address
    reverseGeocode(lat, lng);
  };

  // Handle Form Submission for Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setError('');

    // Prepare payload
    const payload = {
      name: formData.name,
      location: formData.location,
      city: formData.city, // Include city
      type: formData.type,
      basePrice: parseFloat(formData.basePrice),
      rating: parseFloat(formData.rating), 
      description: formData.description,
      amenities: formData.amenities, 
      images: formData.images, 
      // availability is optional; include it only if editing
      ...(isEditing && { availability: formData.availability }),
      latitude: formData.latitude, 
      longitude: formData.longitude, 
    };

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      await axios.put(`${backendUrl}/api/hotels/${selectedHotel.HotelID}`, payload, {
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
        city: '', // Reset city
        type: '',
        basePrice: '',
        rating: '',
        description: '',
        amenities: [],
        images: [],
        availability: {},
        latitude: '',
        longitude: '',
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating hotel:', err);
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          const validationErrors = err.response.data.errors.map((error) => error.msg).join(' | ');
          setError(validationErrors);
          toast.error(validationErrors);
        } else {
          setError(err.response.data.message || 'Failed to update hotel.');
          toast.error(err.response.data.message || 'Failed to update hotel.');
        }
      } else {
        setError('Failed to update hotel.');
        toast.error('Failed to update hotel.');
      }
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
                <strong>City:</strong> {selectedHotel.city} {/* Display city */}
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

              {/* Hotel Name */}
              <input
                type="text"
                name="name"
                placeholder="Hotel Name"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />

              {/* Location Autocomplete Search Box */}
              <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                onPlaceChanged={handlePlaceChanged}
              >
                <input
                  type="text"
                  name="location"
                  placeholder="Search Location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  required
                  className="autocomplete-input"
                />
              </Autocomplete>

              {/* City Input */}
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city || ''}
                onChange={handleChange}
                required
              />

              {/* Type Input */}
              <input
                type="text"
                name="type"
                placeholder="Type (e.g., Hotel, Resort)"
                value={formData.type || ''}
                onChange={handleChange}
                required
              />

              {/* Base Price Input */}
              <input
                type="number"
                name="basePrice"
                placeholder="Base Price ($)"
                value={formData.basePrice || ''}
                onChange={handleChange}
                min="0"
                required
              />

              {/* Rating Input */}
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

              {/* Description Textarea */}
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description || ''}
                onChange={handleChange}
                required
              />

              {/* Amenities Selection */}
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

              {/* Coordinates Section with Map Picker */}
              <div className="coordinates">
                <h3>Coordinates</h3>
                <div className="coordinates-inputs">
                  <input
                    type="number"
                    name="latitude"
                    placeholder="Latitude"
                    value={formData.latitude || ''}
                    onChange={handleChange}
                    step="0.0001"
                    required
                  />
                  <input
                    type="number"
                    name="longitude"
                    placeholder="Longitude"
                    value={formData.longitude || ''}
                    onChange={handleChange}
                    step="0.0001"
                    required
                  />
                </div>
                {/* Map Picker */}
                <div className="map-picker">
                  <h4>Pick Location on Map</h4>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={formData.latitude && formData.longitude ? 15 : 12}
                    center={
                      formData.latitude && formData.longitude
                        ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
                        : defaultCenter
                    }
                    onClick={handleMapClick}
                    options={{
                      disableDefaultUI: false,
                      zoomControl: true,
                    }}
                    onLoad={(map) => (mapRef.current = map)}
                  >
                    {formData.latitude && formData.longitude && (
                      <Marker position={{ lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }} />
                    )}
                  </GoogleMap>
                </div>
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
