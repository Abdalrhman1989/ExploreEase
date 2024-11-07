import React, { useState } from 'react';
import '../styles/BookYourTrip.css';

const BookYourTrip = () => {
  const [formData, setFormData] = useState({
    destination: 'Paris',
    name: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    numGuests: 1,
    specialRequests: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Booking details submitted:', formData);
    // Here you would handle the form submission, possibly sending the data to your backend
  };

  return (
    <div className="book-your-trip-page">
      <h1>Book Your Trip to {formData.destination}</h1>
      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="numGuests">Number of Guests</label>
          <input
            type="number"
            name="numGuests"
            value={formData.numGuests}
            onChange={handleChange}
            min="1"
            max="20"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="specialRequests">Special Requests</label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Any special requests or accommodations?"
          />
        </div>
        <button type="submit" className="cta-button">Confirm Booking</button>
      </form>
    </div>
  );
};

export default BookYourTrip;
