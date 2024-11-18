import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/RestaurantDetails.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { FaInfoCircle } from 'react-icons/fa';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
};

const RestaurantDetails = () => {
  const { id } = useParams(); // Get the restaurant ID from the URL
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false); // Disable button when adding

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        if (!isAuthenticated || !user) {
          throw new Error('You must be logged in to view restaurant details.');
        }

        // Get idToken from user
        const idToken = await user.getIdToken();

        // Fetch restaurant details from your backend
        const response = await axios.get(`${BACKEND_URL}/api/restaurants/${id}`, {
          headers: {
            Authorization: `Bearer ${idToken}`, // Include the token here if required by your backend
          },
        });

        if (response.data.restaurant) {
          console.log('Restaurant Data:', response.data.restaurant); // Debugging
          setRestaurant(response.data.restaurant);
          const latitude = parseFloat(response.data.restaurant.latitude);
          const longitude = parseFloat(response.data.restaurant.longitude);
          setMapCenter({
            lat: latitude,
            lng: longitude,
          });
        } else {
          setError('Unexpected response structure.');
        }
        setIsLoading(false);
      } catch (err) {
        console.error(
          'Error fetching restaurant details:',
          err.response ? err.response.data : err.message
        );
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to fetch restaurant details.'
        );
        toast.error('Failed to load restaurant details.');
        setIsLoading(false);
      }
    };

    // Ensure that AuthContext has finished loading
    if (!loading) {
      if (isAuthenticated && user) {
        fetchRestaurantDetails();
      } else {
        setError('You must be logged in to view restaurant details.');
        setIsLoading(false);
      }
    }
  }, [id, isAuthenticated, loading, user, BACKEND_URL]);

  const handleAddFavorite = async () => {
    if (!isAuthenticated || !user) {
      toast.warn('Please log in to add favorites.');
      return;
    }

    if (!restaurant) return;

    try {
      // Get idToken from user
      const idToken = await user.getIdToken();

      setIsAddingFavorite(true); // Disable button

      // Prepare favoriteData based on backend requirements
      const favoriteData = {
        type: 'restaurant',
        placeId: restaurant.placeId || id, // Use placeId from restaurant data or id from URL
        name: restaurant.name,
        address: restaurant.address || '',
        rating: restaurant.rating || null,
        priceLevel: restaurant.priceLevel || null,
        photoReference: restaurant.photoReference || null,
      };

      // Optional: Log favoriteData for debugging
      console.log('Favorite Data:', favoriteData);

      // Send POST request to add favorite
      await axios.post(`${BACKEND_URL}/api/favorites`, favoriteData, {
        headers: {
          Authorization: `Bearer ${idToken}`, // Include the token here
        },
      });

      toast.success('Favorite added successfully!');
    } catch (err) {
      console.error(
        'Error adding favorite:',
        err.response ? err.response.data : err.message
      );
      if (err.response && err.response.status === 401) {
        toast.error('Unauthorized: Please log in again.');
      } else if (err.response && err.response.status === 400) {
        // Handle validation errors
        const validationErrors = err.response.data.errors;
        if (validationErrors && validationErrors.length > 0) {
          validationErrors.forEach((error) => {
            toast.error(`${error.path}: ${error.msg}`);
          });
        } else {
          toast.error('Bad Request: Invalid data.');
        }
      } else {
        toast.error(
          err.response?.data?.message || 'Failed to add favorite.'
        );
      }
    } finally {
      setIsAddingFavorite(false); // Re-enable button
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loadError)
    return <div className="restaurant-details-error">Error loading maps</div>;
  if (!isLoaded)
    return <div className="restaurant-details-loading">Loading Maps...</div>;
  if (isLoading) {
    return <div className="restaurant-details-loading">Loading...</div>;
  }

  if (error) {
    return <div className="restaurant-details-error">{error}</div>;
  }

  if (!restaurant) {
    return <div className="restaurant-details-no-data">No data available.</div>;
  }

  const handleMarkerClick = () => {
    setSelectedMarker(mapCenter);
  };

  return (
    <div className="restaurant-details-container">
      <button onClick={handleGoBack} className="restaurant-details-back-button">
        ← Back
      </button>
      <h1 className="restaurant-details-title">{restaurant.name}</h1>
      <div className="restaurant-details-map">
        {mapCenter && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={15}
            center={mapCenter}
            options={options}
          >
            <Marker position={mapCenter} onClick={handleMarkerClick} />
            {selectedMarker && (
              <InfoWindow
                position={selectedMarker}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="restaurant-details-info-window">
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.address || ''}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>
      <div className="restaurant-details-info">
        <p>
          <strong>Address:</strong> {restaurant.address || 'N/A'}
        </p>
        {restaurant.rating && <p><strong>Rating:</strong> {restaurant.rating} ⭐</p>}
        {restaurant.priceLevel !== undefined && (
          <p><strong>Price Level:</strong> {'$'.repeat(restaurant.priceLevel)}</p>
        )}
        {restaurant.openingHours && (
          <p><strong>Opening Hours:</strong> {restaurant.openingHours}</p>
        )}
        {restaurant.description && (
          <div>
            <strong>Description:</strong>
            <p>{restaurant.description}</p>
          </div>
        )}
        {restaurant.amenities && restaurant.amenities.length > 0 && (
          <div>
            <strong>Amenities:</strong>
            <ul>
              {restaurant.amenities.map((amenity, index) => (
                <li key={index}>{amenity}</li>
              ))}
            </ul>
          </div>
        )}
        {restaurant.photos && restaurant.photos.length > 0 ? (
          <div className="restaurant-details-images">
            {restaurant.photos.map((photo, index) => (
              <img
                key={index}
                src={
                  photo.photoReference
                    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photoReference}&key=${GOOGLE_MAPS_API_KEY}`
                    : 'https://via.placeholder.com/800x600?text=No+Image'
                }
                alt={`${restaurant.name} - ${index + 1}`}
                className="restaurant-details-image"
                loading="lazy"
              />
            ))}
          </div>
        ) : null}
        <div className="restaurant-details-links">
          {restaurant.website && (
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="restaurant-details-button"
            >
              Visit Website
            </a>
          )}
          {restaurant.url && (
            <a
              href={restaurant.url}
              target="_blank"
              rel="noopener noreferrer"
              className="restaurant-details-button"
            >
              View on Google Maps
            </a>
          )}
        </div>
        <button
          onClick={handleAddFavorite}
          className="restaurant-details-favorite-button"
          disabled={isAddingFavorite} // Disable when adding
        >
          {isAddingFavorite ? 'Adding...' : 'Add to Favorites'}
        </button>
      </div>
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default RestaurantDetails;
