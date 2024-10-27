// frontend/src/pages/HotelDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/HotelDetails.css';
import { toast } from 'react-toastify';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Ensure you have the styles for carousel

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.get(`${backendUrl}/api/hotels/${id}`);
      setHotel(response.data.hotel);
    } catch (err) {
      setError('Failed to fetch hotel details.');
      toast.error('Failed to fetch hotel details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    navigate(`/hotels/${id}/book`);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading hotel details...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!hotel) {
    return <p className="no-hotels-message">Hotel not found.</p>;
  }

  return (
    <div className="hotel-details-container">
      <h2 className="hotel-title">{hotel.name}</h2>

      {/* Carousel to display dynamic images */}
      <div className="hotel-carousel">
        {hotel.images && hotel.images.length > 0 ? (
          <Carousel
            showArrows={true}
            infiniteLoop={true}
            showThumbs={false}
            showStatus={false}
            autoPlay={true}
            interval={5000}
            transitionTime={600}
          >
            {hotel.images.map((img, index) => (
              <div key={index} className="carousel-image-container">
                <img
                  src={img} // Ensure images from the backend are properly formatted URLs
                  alt={`${hotel.name} ${index + 1}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                  }}
                />
              </div>
            ))}
          </Carousel>
        ) : (
            <p>No images available for this hotel.</p>  // Replace this with any other message or content if you don't want a placeholder image
        )}
      </div>

      {/* Hotel Information */}
      <div className="hotel-info">
        <p><strong>Location:</strong> {hotel.location}</p>
        <p><strong>Base Price:</strong> ${parseFloat(hotel.basePrice).toFixed(2)} per night</p>
        <p><strong>Description:</strong> {hotel.description}</p>

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

        {hotel.seasonalPricing && hotel.seasonalPricing.length > 0 && (
          <div className="seasonal-pricing">
            <h4>Seasonal Pricing:</h4>
            <ul>
              {hotel.seasonalPricing.map((season, index) => (
                <li key={index}>
                  {new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()}: ${parseFloat(season.price).toFixed(2)} per night
                </li>
              ))}
            </ul>
          </div>
        )}

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

        <div className="hotel-actions">
          <button className="book-now-button" onClick={handleBookNow}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
