// src/components/HotelConfirmation.jsx

import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/HotelConfirmation.css'; // Optional: Import CSS for styling
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

const HotelConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = location.state || {};
  const { isAuthenticated } = useContext(AuthContext); // Access AuthContext

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      toast.error('No booking information found.');
      navigate('/');
      return;
    }

    const fetchBooking = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
        const response = await axios.get(`${backendUrl}/api/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (response.status === 200) {
          setBooking(response.data.booking);
        } else {
          toast.error('Failed to fetch booking details.');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('An error occurred while fetching booking details.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  if (loading) {
    return <div className="hotel-confirmation-loading">Loading...</div>;
  }

  if (!booking) {
    return <div className="hotel-confirmation-error">Booking not found.</div>;
  }

  return (
    <div className="hotel-confirmation-container">
      <h2>Booking Confirmation</h2>
      <p>Thank you for your booking! Here are your booking details:</p>
      <div className="booking-details">
        <p><strong>Booking ID:</strong> {booking.BookingID}</p>
        <p><strong>Hotel:</strong> {booking.hotel.name}</p>
        <p><strong>Check-In:</strong> {new Date(booking.checkIn).toLocaleDateString()}</p>
        <p><strong>Check-Out:</strong> {new Date(booking.checkOut).toLocaleDateString()}</p>
        <p><strong>Guests:</strong> {booking.guests}</p>
        <p><strong>Room Type:</strong> {booking.roomType}</p>
        <p><strong>Status:</strong> {booking.status}</p>
      </div>
      <button onClick={() => navigate('/')} className="confirmation-button">
        Back to Home
      </button>
    </div>
  );
};

export default HotelConfirmation;
