import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/AttractionDetails.css';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
};

const AttractionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, idToken, user, loading } = useContext(AuthContext);
  const [attraction, setAttraction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    const fetchAttractionDetails = async () => {
      try {
        if (!isAuthenticated || !user) {
          throw new Error('You must be logged in to view attraction details.');
        }

        // Force refresh the token to ensure it's fresh
        const freshToken = await user.getIdToken(true);
        console.log(`Fetching attraction details for ID: ${id} with fresh token: ${freshToken}`);

        const response = await axios.get(`${BACKEND_URL}/api/attractions/${id}`, {
          headers: {
            Authorization: `Bearer ${freshToken}`,
          },
        });
        console.log('API Response:', response.data);

        if (response.data.attraction) {
          setAttraction(response.data.attraction);
          const latitude = parseFloat(response.data.attraction.latitude);
          const longitude = parseFloat(response.data.attraction.longitude);
          console.log(`User-Created Attraction Coordinates: lat=${latitude}, lng=${longitude}`);
          setMapCenter({
            lat: latitude,
            lng: longitude,
          });
        } else if (response.data.place) {
          const place = response.data.place;
          setAttraction(place);
          const latitude = place.geometry.location.lat;
          const longitude = place.geometry.location.lng;
          console.log(`Google Place Coordinates: lat=${latitude}, lng=${longitude}`);
          setMapCenter({
            lat: latitude,
            lng: longitude,
          });
        } else {
          console.warn('Unexpected data structure:', response.data);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching attraction details:', err.response ? err.response.data : err.message);
        setError(err.response?.data?.message || err.message || 'Failed to fetch attraction details.');
        setIsLoading(false);
      }
    };

    if (!loading) {
      if (isAuthenticated && idToken && user) {
        fetchAttractionDetails();
      } else {
        setError('You must be logged in to view attraction details.');
        setIsLoading(false);
      }
    }
  }, [id, isAuthenticated, idToken, loading, user, BACKEND_URL]);

  const handleAddFavorite = async () => {
    if (!isAuthenticated || !user) {
      alert('Please log in to add favorites.');
      return;
    }

    if (!attraction) return;

    try {
      const freshToken = await user.getIdToken(true);
      console.log(`Adding favorite with fresh token: ${freshToken}`);

      const favoriteData = {
        type: 'attraction',
        placeId: attraction.place_id || attraction.AttractionID,
        name: attraction.name,
        address: attraction.formatted_address || attraction.location || '',
        rating: attraction.rating || null,
        priceLevel: attraction.price_level || attraction.priceLevel || null,
        photoReference:
          attraction.photos && attraction.photos.length > 0
            ? attraction.photos[0].photo_reference
            : attraction.images && attraction.images.length > 0
            ? attraction.images[0]
            : null,
      };

      console.log('Favorite Data:', favoriteData);

      await axios.post(`${BACKEND_URL}/api/favorites`, favoriteData, {
        headers: {
          Authorization: `Bearer ${freshToken}`,
        },
      });
      alert('Favorite added successfully!');
    } catch (err) {
      console.error('Error adding favorite:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Failed to add favorite.');
      }
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loadError)
    return <div className="attraction-details-error">Error loading maps</div>;
  if (!isLoaded)
    return <div className="attraction-details-loading">Loading Maps...</div>;
  if (isLoading) {
    return <div className="attraction-details-loading">Loading...</div>;
  }

  if (error) {
    return <div className="attraction-details-error">{error}</div>;
  }

  if (!attraction) {
    return <div className="attraction-details-no-data">No data available.</div>;
  }

  const handleMarkerClick = () => {
    setSelectedMarker(mapCenter);
  };

  return (
    <div className="attractions-component attraction-details-container">
      <button onClick={handleGoBack} className="attractions-component-explore-button">
        ← Back
      </button>
      <h1 className="attractions-component-title">{attraction.name}</h1>
      <div className="attractions-component-map">
        {mapCenter && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={15}
            center={mapCenter}
            options={options}
          >
            <Marker
              position={mapCenter}
              onClick={handleMarkerClick}
            />
            {selectedMarker && (
              <InfoWindow
                position={selectedMarker}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="attractions-component-info-window">
                  <h3>{attraction.name}</h3>
                  <p>{attraction.formatted_address || attraction.location}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>
      <div className="attractions-component-info">
        <p>
          <strong>Address:</strong> {attraction.formatted_address || attraction.location}
        </p>
        {attraction.rating && <p><strong>Rating:</strong> {attraction.rating} ⭐</p>}
        {attraction.price_level !== undefined && (
          <p><strong>Price Level:</strong> {'$'.repeat(attraction.price_level)}</p>
        )}
        {attraction.openingHours && (
          <p><strong>Opening Hours:</strong> {attraction.openingHours}</p>
        )}
        {attraction.description && (
          <div>
            <strong>Description:</strong>
            <p>{attraction.description}</p>
          </div>
        )}
        {attraction.amenities && attraction.amenities.length > 0 && (
          <div>
            <strong>Amenities:</strong>
            <ul>
              {attraction.amenities.map((amenity, index) => (
                <li key={index}>{amenity}</li>
              ))}
            </ul>
          </div>
        )}
        {attraction.photos && attraction.photos.length > 0 ? (
          <div className="attractions-component-images">
            {attraction.photos.map((photo, index) => (
              <img
                key={index}
                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`}
                alt={`${attraction.name} - ${index + 1}`}
                className="attractions-component-image"
                loading="lazy"
              />
            ))}
          </div>
        ) : attraction.images && attraction.images.length > 0 ? (
          <div className="attractions-component-images">
            {attraction.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${attraction.name} - ${index + 1}`}
                className="attractions-component-image"
                loading="lazy"
              />
            ))}
          </div>
        ) : null}
        <div className="attractions-component-links">
          {attraction.website && (
            <a href={attraction.website} target="_blank" rel="noopener noreferrer" className="attractions-component-explore-button">
              Visit Website
            </a>
          )}
          {attraction.url && (
            <a href={attraction.url} target="_blank" rel="noopener noreferrer" className="attractions-component-explore-button">
              View on Google Maps
            </a>
          )}
        </div>
        <button onClick={handleAddFavorite} className="attractions-component-favorite-button">
          Add to Favorites
        </button>
      </div>
      {/* Optionally, include user reviews or other details here */}
    </div>
  );
};

export default AttractionDetails;
