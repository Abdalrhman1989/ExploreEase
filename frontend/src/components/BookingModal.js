// src/components/BookingModal.js

import React from 'react';
import '../styles/BookingModal.css';

const BookingModal = ({ flight, onClose }) => {
  if (!flight) return null;

  const handleBooking = () => {
    // Implement booking logic, such as redirecting to payment or saving booking details
    alert('Booking functionality to be implemented.');
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Book Your Flight</h2>
        <div className="flight-details">
          <p><strong>From:</strong> {flight.departure.iata} - {flight.departure.airport}</p>
          <p><strong>To:</strong> {flight.arrival.iata} - {flight.arrival.airport}</p>
          <p><strong>Departure:</strong> {new Date(flight.departure.scheduled).toLocaleString()}</p>
          <p><strong>Arrival:</strong> {new Date(flight.arrival.scheduled).toLocaleString()}</p>
          <p><strong>Airline:</strong> {flight.airline.name}</p>
        </div>
        {/* Add passenger details form or integrate with a booking system */}
        <button className="book-button" onClick={handleBooking}>Proceed to Book</button>
      </div>
    </div>
  );
};

export default BookingModal;
