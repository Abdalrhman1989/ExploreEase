// src/components/ApprovedHotels.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ApprovedHotels.css';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import calendar styles
import { format } from 'date-fns';
import { FaCalendarAlt, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

const ApprovedHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null); // Track selected hotel for calendar
  const [expandedHotelId, setExpandedHotelId] = useState(null); // Track which hotel is expanded

  useEffect(() => {
    fetchApprovedHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchApprovedHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.get(`${backendUrl}/api/hotels/approved`, {
        params: {
          page: 1,
          limit: 100, // Adjust as needed
        },
      });
      setHotels(response.data.hotels);
    } catch (err) {
      console.error('Error fetching approved hotels:', err.response ? err.response.data : err.message);
      setError('Failed to fetch partner hotels.');
      toast.error('Failed to fetch partner hotels.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle hotel selection for calendar
  const handleHotelSelect = (hotel) => {
    setSelectedHotel(hotel);
  };

  // Function to close the calendar modal
  const closeCalendar = () => {
    setSelectedHotel(null);
  };

  // Function to toggle hotel card expansion
  const toggleExpand = (hotelId) => {
    setExpandedHotelId(expandedHotelId === hotelId ? null : hotelId);
  };

  return (
    <div className="approved-hotels-container">
      <h2>Our Partner Hotels</h2>
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading partner hotels...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : hotels.length === 0 ? (
        <p className="no-hotels-message">No partner hotels available at the moment.</p>
      ) : (
        <div className="hotels-grid">
          {hotels.map((hotel) => (
            <div key={hotel.HotelID} className="hotel-card">
              <div className="hotel-image">
                {hotel.images && hotel.images.length > 0 ? (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
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
              <div className="hotel-details">
                <h3>
                  <FaInfoCircle /> {hotel.name}
                </h3>
                <p><FaInfoCircle /> <strong>Location:</strong> {hotel.location}</p>
                <p><FaInfoCircle /> <strong>Base Price:</strong> ${parseFloat(hotel.basePrice).toFixed(2)} per night</p>
                {expandedHotelId === hotel.HotelID && (
                  <>
                    <p><FaInfoCircle /> <strong>Description:</strong> {hotel.description}</p>
                    {/* Room Types */}
                    {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                      <div className="room-types">
                        <h4>Room Types:</h4>
                        <ul>
                          {hotel.roomTypes.map((room, index) => (
                            <li key={index}>
                              <strong>{room.type}</strong> - ${parseFloat(room.price).toFixed(2)} per night ({room.availability})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Seasonal Pricing */}
                    {hotel.seasonalPricing && hotel.seasonalPricing.length > 0 && (
                      <div className="seasonal-pricing">
                        <h4>Seasonal Pricing:</h4>
                        <ul>
                          {hotel.seasonalPricing.map((season, index) => (
                            <li key={index}>
                              {format(new Date(season.startDate), 'MMM dd, yyyy')} - {format(new Date(season.endDate), 'MMM dd, yyyy')}: ${parseFloat(season.price).toFixed(2)} per night
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Amenities */}
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="amenities">
                        <h4>Amenities:</h4>
                        <ul>
                          {hotel.amenities.map((amenity, index) => (
                            <li key={index}>{amenity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
                <button
                  className="expand-button"
                  onClick={() => toggleExpand(hotel.HotelID)}
                  aria-expanded={expandedHotelId === hotel.HotelID}
                  aria-controls={`hotel-details-${hotel.HotelID}`}
                >
                  {expandedHotelId === hotel.HotelID ? (
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
                <div className="hotel-actions">
                  <Link to={`/hotels/${hotel.HotelID}`} className="view-details-button">
                    <FaInfoCircle /> View Details
                  </Link>
                  <button
                    onClick={() => handleHotelSelect(hotel)}
                    className="view-calendar-button"
                    aria-label={`View availability for ${hotel.name}`}
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
      {selectedHotel && (
        <div className={`availability-modal-overlay show`} onClick={closeCalendar}>
          <div className="availability-modal-content" onClick={(e) => e.stopPropagation()}>
            <MdClose className="close-button" onClick={closeCalendar} aria-label="Close calendar" />
            <h3>Availability for {selectedHotel.name}</h3>
            <div className="calendar-container">
              <Calendar
                // Define tileClassName to mark available/unavailable dates
                tileClassName={({ date, view }) => {
                  if (view === 'month') {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isAvailable = selectedHotel.availability ? selectedHotel.availability[dateStr] : null;
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

export default ApprovedHotels;
