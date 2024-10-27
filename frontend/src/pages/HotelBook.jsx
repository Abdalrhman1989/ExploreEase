// frontend/src/pages/HotelBook.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/HotelBook.css';
import { toast } from 'react-toastify';

const HotelBook = () => {
  const { id } = useParams(); // Hotel ID from the URL
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHotelDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.get(`${backendUrl}/api/hotels/${id}`);
      setHotel(response.data.hotel);
    } catch (err) {
      console.error('Error fetching hotel details:', err.response ? err.response.data : err.message);
      setError('Failed to fetch hotel details.');
      toast.error('Failed to fetch hotel details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.post(`${backendUrl}/api/bookings`, {
        hotelId: id,
        ...formData,
      });
      if (response.status === 201) {
        toast.success('Booking successful!');
        // Optionally, redirect to a confirmation page
        window.location.href = `/confirmation?bookingId=${response.data.bookingId}`;
      } else {
        toast.error(response.data.message || 'Booking failed.');
      }
    } catch (err) {
      console.error('Error submitting booking:', err.response ? err.response.data : err.message);
      toast.error('Booking failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-loading-spinner">
        <div className="spinner"></div>
        <p>Loading booking form...</p>
      </div>
    );
  }

  if (error) {
    return <div className="booking-error-message">{error}</div>;
  }

  if (!hotel) {
    return <p className="booking-no-hotel-message">Hotel not found.</p>;
  }

  return (
    <div className="hotel-book-container">
      <h2>Book Your Stay at {hotel.name}</h2>
      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="fullName">Full Name<span className="required">*</span></label>
        </div>

        <div className="form-group">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="email">Email Address<span className="required">*</span></label>
        </div>

        <div className="form-group">
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="phone">Phone Number<span className="required">*</span></label>
        </div>

        <div className="form-group">
          <input
            type="date"
            id="checkIn"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="checkIn">Check-In Date<span className="required">*</span></label>
        </div>

        <div className="form-group">
          <input
            type="date"
            id="checkOut"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="checkOut">Check-Out Date<span className="required">*</span></label>
        </div>

        <div className="form-group">
          <input
            type="number"
            id="guests"
            name="guests"
            min="1"
            value={formData.guests}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="guests">Number of Guests<span className="required">*</span></label>
        </div>

        <div className="form-group">
          <select
            id="roomType"
            name="roomType"
            value={formData.roomType}
            onChange={handleChange}
            required
          >
            <option value="">Select a room type</option>
            {hotel.roomTypes && hotel.roomTypes.map((room, index) => (
              <option key={index} value={room.type}>
                {room.type} - ${parseFloat(room.price).toFixed(2)} per night
              </option>
            ))}
          </select>
          <label htmlFor="roomType">Room Type<span className="required">*</span></label>
        </div>

        <button type="submit" className="submit-booking-button" disabled={submitting}>
          {submitting ? 'Booking...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
};

export default HotelBook;
