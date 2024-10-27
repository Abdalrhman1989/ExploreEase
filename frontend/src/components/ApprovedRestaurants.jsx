// src/components/ApprovedRestaurants.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ApprovedRestaurants.css';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { FaCalendarAlt, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import api from '../utils/api'; // Ensure this is correctly imported

const ApprovedRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [expandedRestaurantId, setExpandedRestaurantId] = useState(null);

  useEffect(() => {
    fetchApprovedRestaurants();
  }, []);

  const fetchApprovedRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/restaurants/approved', {
        params: {
          page: 1,
          limit: 100,
        },
      });
      console.log('Fetched Approved Restaurants:', response.data.restaurants); // Debugging line
      setRestaurants(response.data.restaurants);
    } catch (err) {
      console.error('Error fetching approved restaurants:', err.response ? err.response.data : err.message);
      setError('Failed to fetch partner restaurants.');
      toast.error('Failed to fetch partner restaurants.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const closeCalendar = () => {
    setSelectedRestaurant(null);
  };

  const toggleExpand = (restaurantId) => {
    setExpandedRestaurantId(expandedRestaurantId === restaurantId ? null : restaurantId);
  };

  const handleRefresh = () => {
    fetchApprovedRestaurants();
  };

  return (
    <div className="approved-restaurants-container">
      <div className="approved-restaurants-header">
        <h2>Our Partner Restaurants</h2>
        <button onClick={handleRefresh} className="refresh-button" aria-label="Refresh restaurants">
          Refresh <FaChevronUp />
        </button>
      </div>
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading partner restaurants...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : restaurants.length === 0 ? (
        <p className="no-restaurants-message">No partner restaurants available at the moment.</p>
      ) : (
        <div className="restaurants-grid">
          {restaurants.map((restaurant) => (
            <div key={restaurant.RestaurantID} className="restaurant-card">
              <div className="restaurant-image">
                {restaurant.images && restaurant.images.length > 0 ? (
                  <img
                    src={restaurant.images[0]}
                    alt={restaurant.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                ) : (
                  <img
                    src="https://via.placeholder.com/300x200?text=No+Image"
                    alt="No image available"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="restaurant-details">
                <h3>
                  <FaInfoCircle /> {restaurant.name}
                </h3>
                <p><FaInfoCircle /> <strong>Location:</strong> {restaurant.location}</p>
                <p><FaInfoCircle /> <strong>Cuisine:</strong> {restaurant.cuisine}</p>
                <p><FaInfoCircle /> <strong>Price Range:</strong> {'$'.repeat(restaurant.priceRange)}</p>
                <p><FaInfoCircle /> <strong>Rating:</strong> {restaurant.rating} ⭐</p>
                {expandedRestaurantId === restaurant.RestaurantID && (
                  <>
                    <p><FaInfoCircle /> <strong>Description:</strong> {restaurant.description}</p>
                    {/* Amenities */}
                    {restaurant.amenities && restaurant.amenities.length > 0 && (
                      <div className="amenities">
                        <h4>Amenities:</h4>
                        <ul>
                          {restaurant.amenities.map((amenity, index) => (
                            <li key={index}>{amenity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
                <button
                  className="expand-button"
                  onClick={() => toggleExpand(restaurant.RestaurantID)}
                  aria-expanded={expandedRestaurantId === restaurant.RestaurantID}
                  aria-controls={`restaurant-details-${restaurant.RestaurantID}`}
                >
                  {expandedRestaurantId === restaurant.RestaurantID ? (
                    <>
                      See Less <FaChevronUp />
                    </>
                  ) : (
                    <>
                      See More <FaChevronDown />
                    </>
                  )}
                </button>
                {/* Additional Actions */}
                <div className="restaurant-actions">
                  <Link to={`/restaurants/${restaurant.RestaurantID}`} className="view-details-button">
                    <FaInfoCircle /> View Details
                  </Link>
                  <button
                    onClick={() => handleRestaurantSelect(restaurant)}
                    className="view-calendar-button"
                    aria-label={`View availability for ${restaurant.name}`}
                  >
                    <FaCalendarAlt /> View Availability
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Availability Calendar Modal */}
      {selectedRestaurant && (
        <div className={`availability-modal-overlay show`} onClick={closeCalendar}>
          <div className="availability-modal-content" onClick={(e) => e.stopPropagation()}>
            <MdClose className="close-button" onClick={closeCalendar} aria-label="Close calendar" />
            <h3>Availability for {selectedRestaurant.name}</h3>
            <div className="calendar-container">
              <Calendar
                tileClassName={({ date, view }) => {
                  if (view === 'month') {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isAvailable = selectedRestaurant.availability ? selectedRestaurant.availability[dateStr] : null;
                    if (isAvailable === true) {
                      return 'available-date';
                    } else if (isAvailable === false) {
                      return 'unavailable-date';
                    }
                  }
                  return null;
                }}
              />
            </div>
            {/* Legend */}
            <div className="calendar-legend">
              <span className="available-dot"></span> Available
              <span className="unavailable-dot"></span> Unavailable
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedRestaurants;
