// frontend/src/components/ApprovedAttractions.jsx

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/Stays.css'; // Utilizing existing styles from Stays.css

const ApprovedAttractions = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [approvedAttractions, setApprovedAttractions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Function to fetch approved attractions from the backend
  const fetchApprovedAttractions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3001/api/attractions/approved');
      setApprovedAttractions(response.data.attractions);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching approved attractions:', err.response ? err.response.data : err.message);
      setError('Failed to fetch approved attractions.');
      setIsLoading(false);
    }
  }, []);

  // Function to add an attraction to favorites
  const addFavoriteToDB = useCallback(async (favoriteData) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to add favorites.');
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      await axios.post(
        `${backendUrl}/api/favorites`,
        favoriteData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      toast.success('Favorite added successfully!');
    } catch (err) {
      console.error('Error adding favorite:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data) {
        if (Array.isArray(err.response.data.errors)) {
          const errorMessages = err.response.data.errors.map(error => error.msg).join('\n');
          toast.error(`Error: ${errorMessages}`);
        } else if (err.response.data.Objecterrors && Array.isArray(err.response.data.Objecterrors)) {
          const errorMessages = err.response.data.Objecterrors.map(error => error.msg).join('\n');
          toast.error(`Error: ${errorMessages}`);
        } else if (err.response.data.message) {
          toast.error(`Error: ${err.response.data.message}`);
        } else {
          toast.error('Failed to add favorite.');
        }
      } else {
        toast.error('Failed to add favorite.');
      }
    }
  }, [isAuthenticated, user]);

  // Function to remove an attraction from favorites
  const removeFavoriteFromDB = useCallback(async (favoriteId) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to remove favorites.');
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      await axios.delete(`${backendUrl}/api/favorites/${favoriteId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      toast.success('Favorite removed successfully!');
    } catch (err) {
      console.error('Error removing favorite:', err.response ? err.response.data : err.message);
      toast.error('Failed to remove favorite.');
    }
  }, [isAuthenticated, user]);

  // Fetch approved attractions on component mount
  useEffect(() => {
    fetchApprovedAttractions();
  }, [fetchApprovedAttractions]);

  // Function to construct the photo URL from Google Place Photo Reference
  const getPhotoUrl = (photoReference) => {
    if (photoReference) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
    }
    return 'https://via.placeholder.com/400'; // Fallback image if no photo reference
  };

  return (
    <div className="stays-component-approved-attractions-section">
      <h2>Approved User-Created Attractions</h2>
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="stays-component-spinner">
          <div className="spinner"></div>
          <p>Loading approved attractions...</p>
        </div>
      )}
      
      {/* Error Message */}
      {error && <div className="stays-component-error-message">{error}</div>}
      
      {/* Attractions Grid */}
      <div className="stays-component-grid">
        {approvedAttractions.length > 0 ? (
          approvedAttractions.map((attraction) => (
            <div key={attraction.id} className="stays-component-item">
              {/* Attraction Image */}
              <button
                onClick={() => navigate(`/attractions/${attraction.id}`)}
                className="stays-component-image-button"
                aria-label={`View details for ${attraction.name}`}
              >
                {attraction.photoReference ? (
                  <img
                    src={getPhotoUrl(attraction.photoReference)}
                    alt={attraction.name}
                    className="stays-component-placeholder"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="stays-component-placeholder no-image">
                    <p>No image available.</p>
                  </div>
                )}
              </button>
              
              {/* Attraction Information */}
              <div className="stays-component-info">
                <h3>{attraction.name}</h3>
                {attraction.rating && <p>Rating: {attraction.rating} ⭐</p>}
                {attraction.priceLevel !== undefined && (
                  <p>Price Level: {'$'.repeat(attraction.priceLevel)}</p>
                )}
                <p>{attraction.address || 'No address available'}</p>
                
                {/* Action Buttons */}
                <div className="stays-component-actions">
                  <button
                    onClick={() => navigate(`/attractions/${attraction.id}`)}
                    className="stays-component-view-details-button"
                    aria-label={`View details for ${attraction.name}`}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      const favoriteData = {
                        type: 'attraction', // Adjust based on your backend schema
                        placeId: attraction.id, // Ensure 'id' corresponds to 'placeId'
                        name: attraction.name,
                        address: attraction.address || '',
                        rating: attraction.rating || null,
                        priceLevel: attraction.priceLevel || null,
                        photoReference: attraction.photoReference || null,
                      };
                      addFavoriteToDB(favoriteData);
                    }}
                    className="stays-component-add-favorite-button"
                    aria-label={`Add ${attraction.name} to Favorites`}
                  >
                    Add to Favorites
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          !isLoading && <p className="stays-component-no-attractions-message">No approved attractions to display.</p>
        )}
      </div>
    </div>
  );
};

export default ApprovedAttractions;
