// frontend/src/components/AttractionForm.jsx

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/AttractionForm.css'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const AttractionForm = () => {
  const { isAuthenticated, userRole, user, idToken, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [attraction, setAttraction] = useState({
    name: '',
    location: '',
    city: '',
    type: '',
    entryFee: '',
    openingHours: '',
    description: '',
    amenities: [],
    images: [],
    latitude: '',
    longitude: '',
  });
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_GEOCODING_API_KEY,
    libraries,
  });

  // Handle map click to set marker
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    setAttraction({ ...attraction, latitude: lat, longitude: lng });
  };

  // Handle form field changes
  const handleChange = (e) => {
    setAttraction({ ...attraction, [e.target.name]: e.target.value });
  };

  // Handle Amenity changes
  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    const newAmenities = checked
      ? [...selectedAmenities, value]
      : selectedAmenities.filter((amenity) => amenity !== value);
    setSelectedAmenities(newAmenities);
    setAttraction({ ...attraction, amenities: newAmenities });
  };

  // Handle Image Upload and Conversion to Base64
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    convertFilesToBase64(files)
      .then((base64Images) => {
        setImages(base64Images);
        setAttraction({ ...attraction, images: base64Images });
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

  // Optionally: Handle geocoding to auto-fill latitude and longitude
  const handleGeocode = async () => {
    if (!attraction.location || !attraction.city) {
      setError('Please enter both location and city to geocode.');
      return;
    }

    try {
      const geocodingApiKey = process.env.REACT_APP_GOOGLE_GEOCODING_API_KEY;
      const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: `${attraction.location}, ${attraction.city}`,
          key: geocodingApiKey,
        },
      });

      if (geocodeResponse.data.status === 'OK') {
        const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
        setAttraction({ ...attraction, latitude: lat, longitude: lng });
        setMarkerPosition({ lat, lng }); // Update marker position on the map
        setError(null);
      } else {
        setError('Failed to geocode the provided location.');
      }
    } catch (err) {
      console.error('Error during geocoding:', err);
      setError('Error during geocoding. Please try again later.');
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      if (loading) {
        setError('Authentication is still loading. Please wait.');
        return;
      }

      if (!isAuthenticated || !userRole) {
        setError('Authentication required. Please log in.');
        return;
      }

      // Ensure the user has the right role
      if (!['User', 'BusinessAdministrator'].includes(userRole)) {
        setError('You do not have permission to perform this action.');
        return;
      }

      if (!idToken) {
        setError('Authentication token is missing. Please log in again.');
        return;
      }

      // Validate latitude and longitude
      const latitude = parseFloat(attraction.latitude);
      const longitude = parseFloat(attraction.longitude);
      if (
        isNaN(latitude) ||
        isNaN(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        setError('Please enter valid latitude and longitude values.');
        return;
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

      const payload = {
        name: attraction.name,
        location: attraction.location,
        city: attraction.city,
        type: attraction.type,
        entryFee: parseFloat(attraction.entryFee),
        openingHours: attraction.openingHours,
        description: attraction.description,
        amenities: attraction.amenities,
        images: attraction.images,
        latitude: latitude,
        longitude: longitude,
      };

      const response = await axios.post(`${backendUrl}/api/attractions`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`, // Include the token
        },
      });

      setMessage(response.data.message);
      // Reset form fields
      setAttraction({
        name: '',
        location: '',
        city: '',
        type: '',
        entryFee: '',
        openingHours: '',
        description: '',
        amenities: [],
        images: [],
        latitude: '',
        longitude: '',
      });
      setImages([]);
      setSelectedAmenities([]);
      setMarkerPosition(null); // Reset marker
      // Optionally, scroll to the message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting attraction:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to submit attraction');
      } else {
        setError('Failed to submit attraction');
      }
    }
  };

  // Optional: Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  if (loadError) return <div className="attractions-error">Error loading maps</div>;
  if (!isLoaded && !loading) return <div className="attractions-loading">Loading Maps...</div>;

  return (
    <form className="attraction-form" onSubmit={handleSubmit}>
      <h2>Add New Attraction</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <input
        type="text"
        name="name"
        placeholder="Attraction Name"
        value={attraction.name}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="location"
        placeholder="Location"
        value={attraction.location}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="city"
        placeholder="City"
        value={attraction.city}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="type"
        placeholder="Type"
        value={attraction.type}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="entryFee"
        placeholder="Entry Fee ($)"
        value={attraction.entryFee}
        onChange={handleChange}
        min="0"
        step="0.01"
        required
      />

      <input
        type="text"
        name="openingHours"
        placeholder="Opening Hours"
        value={attraction.openingHours}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={attraction.description}
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
            checked={attraction.amenities.includes('WiFi')}
          />
          WiFi
        </label>
        <label>
          <input
            type="checkbox"
            value="Parking"
            onChange={handleAmenityChange}
            checked={attraction.amenities.includes('Parking')}
          />
          Parking
        </label>
        <label>
          <input
            type="checkbox"
            value="Restrooms"
            onChange={handleAmenityChange}
            checked={attraction.amenities.includes('Restrooms')}
          />
          Restrooms
        </label>
        {/* Add more amenities as needed */}
      </div>

      {/* Image Upload */}
      <div className="image-upload">
        <h3>Attraction Images</h3>
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
        {images.length > 0 && (
          <div className="image-previews">
            {images.map((base64, index) => (
              <img
                key={index}
                src={base64}
                alt={`Attraction Image ${index + 1}`}
                className="preview-image"
              />
            ))}
          </div>
        )}
      </div>

      {/* Coordinates Section with Map Picker */}
      <div className="coordinates">
        <h3>Coordinates</h3>
        <div className="coordinates-inputs">
          <input
            type="number"
            name="latitude"
            placeholder="Latitude"
            value={attraction.latitude}
            onChange={handleChange}
            step="0.0001"
            required
          />
          <input
            type="number"
            name="longitude"
            placeholder="Longitude"
            value={attraction.longitude}
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
            zoom={markerPosition ? 15 : 12}
            center={markerPosition || { lat: 48.8566, lng: 2.3522 }} // Default to Paris
            onClick={handleMapClick}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            {markerPosition && <Marker position={markerPosition} />}
          </GoogleMap>
        </div>
        {/* Geocode Button */}
        <button type="button" onClick={handleGeocode} className="geocode-button">
          Geocode Address
        </button>
      </div>

      <button type="submit" className="submit-button">
        Add Attraction
      </button>
    </form>
  );
};

export default AttractionForm;
