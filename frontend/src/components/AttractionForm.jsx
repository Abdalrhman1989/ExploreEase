// frontend/src/components/AttractionForm.jsx

import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/AttractionForm.css'; // Ensure this path is correct
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const defaultCenter = {
  lat: 48.8566, // Fallback to Paris
  lng: 2.3522,
};

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const AttractionForm = () => {
  const { isAuthenticated, userRole, user, idToken, loading } = useContext(AuthContext);
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
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  // Effect to get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error fetching user location:', error);
          // Notify the user about the fallback
          toast.info('Unable to retrieve your location. Defaulting to Paris.');
        }
      );
    } else {
      console.error('Geolocation not supported by this browser.');
      toast.info('Geolocation is not supported by your browser. Defaulting to Paris.');
    }
  }, []);

  // Handle map click to set marker position
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    setAttraction({ ...attraction, latitude: lat, longitude: lng });
    // Optionally, reverse geocode to get address
    reverseGeocode(lat, lng);
  };

  // Handle Place Selection from Autocomplete
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setMarkerPosition({ lat, lng });
      setMapCenter({ lat, lng });
      setAttraction({
        ...attraction,
        location: place.formatted_address || place.name || '',
        latitude: lat,
        longitude: lng,
      });
    } else {
      toast.error('No details available for the selected location.');
    }
  };

  // Reverse Geocoding: Get address from coordinates
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
        setAttraction((prevAttraction) => ({
          ...prevAttraction,
          location: address,
        }));
      } else {
        toast.error('Failed to retrieve address from coordinates.');
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      toast.error('Error retrieving address from coordinates.');
    }
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

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    toast.dismiss(); // Dismiss existing toasts

    try {
      if (loading) {
        setError('Authentication is still loading. Please wait.');
        toast.error('Authentication is still loading. Please wait.');
        return;
      }

      if (!isAuthenticated || !userRole) {
        setError('Authentication required. Please log in.');
        toast.error('Authentication required. Please log in.');
        return;
      }

      // Ensure the user has the right role
      if (!['User', 'BusinessAdministrator'].includes(userRole)) {
        setError('You do not have permission to perform this action.');
        toast.error('You do not have permission to perform this action.');
        return;
      }

      if (!idToken) {
        setError('Authentication token is missing. Please log in again.');
        toast.error('Authentication token is missing. Please log in again.');
        return;
      }

      // Validate required fields
      const {
        name,
        location,
        city,
        type,
        entryFee,
        openingHours,
        description,
        amenities,
        images: attractionImages,
        latitude,
        longitude,
      } = attraction;

      if (
        !name ||
        !location ||
        !city ||
        !type ||
        !entryFee ||
        !openingHours ||
        !description ||
        !latitude ||
        !longitude
      ) {
        setError('Please fill in all required fields.');
        toast.error('Please fill in all required fields.');
        return;
      }

      // Validate latitude and longitude
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (
        isNaN(lat) ||
        isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        setError('Please enter valid latitude and longitude values.');
        toast.error('Please enter valid latitude and longitude values.');
        return;
      }

      // Validate entryFee
      const fee = parseFloat(entryFee);
      if (isNaN(fee) || fee < 0) {
        setError('Entry fee must be a non-negative number.');
        toast.error('Entry fee must be a non-negative number.');
        return;
      }

      // Construct the payload
      const payload = {
        name,
        location,
        city,
        type,
        entryFee: fee,
        openingHours,
        description,
        amenities,
        images: attractionImages,
        latitude: lat,
        longitude: lng,
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

      const response = await axios.post(`${backendUrl}/api/attractions`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`, // Include the token
        },
      });

      setMessage(response.data.message);
      toast.success(response.data.message);

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
      setMapCenter(defaultCenter); // Reset map center
      // Optionally, navigate to another page
      // navigate('/attractions');
    } catch (err) {
      console.error('Error submitting attraction:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to submit attraction');
        toast.error(err.response.data.message || 'Failed to submit attraction');
      } else {
        setError('Failed to submit attraction');
        toast.error('Failed to submit attraction');
      }
    }
  };

  // Optional: Show loading state
  if (loading) {
    return <div className="attraction-loading">Loading...</div>;
  }

  if (loadError) return <div className="attractions-error">Error loading maps</div>;
  if (!isLoaded && !loading) return <div className="attractions-loading">Loading Maps...</div>;

  return (
    <form className="attraction-form" onSubmit={handleSubmit}>
      <h2>Add New Attraction</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Attraction Name */}
      <input
        type="text"
        name="name"
        placeholder="Attraction Name"
        value={attraction.name}
        onChange={handleChange}
        required
      />

      {/* Location Autocomplete Search Box */}
      <Autocomplete onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)} onPlaceChanged={handlePlaceChanged}>
        <input
          type="text"
          name="location"
          placeholder="Search Location"
          value={attraction.location}
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
        value={attraction.city}
        onChange={handleChange}
        required
      />

      {/* Type Input */}
      <input
        type="text"
        name="type"
        placeholder="Type (e.g., Museum, Park)"
        value={attraction.type}
        onChange={handleChange}
        required
      />

      {/* Entry Fee Input */}
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

      {/* Opening Hours Input */}
      <input
        type="text"
        name="openingHours"
        placeholder="Opening Hours (e.g., 9 AM - 5 PM)"
        value={attraction.openingHours}
        onChange={handleChange}
        required
      />

      {/* Description Textarea */}
      <textarea
        name="description"
        placeholder="Description"
        value={attraction.description}
        onChange={handleChange}
        required
      />

      {/* Amenities Selection */}
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
            disabled
          />
          <input
            type="number"
            name="longitude"
            placeholder="Longitude"
            value={attraction.longitude}
            onChange={handleChange}
            step="0.0001"
            required
            disabled
          />
        </div>
        {/* Map Picker */}
        <div className="map-picker">
          <h4>Pick Location on Map</h4>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={markerPosition ? 15 : 12}
            center={mapCenter} // Dynamic map center based on user's location
            onClick={handleMapClick}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
            }}
            onLoad={(map) => (mapRef.current = map)}
          >
            {markerPosition && <Marker position={markerPosition} />}
          </GoogleMap>
        </div>
      </div>

      <button type="submit" className="submit-button">
        Add Attraction
      </button>

      <ToastContainer />
    </form>
  );
};

export default AttractionForm;
