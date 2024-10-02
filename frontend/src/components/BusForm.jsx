// src/components/BusForm.jsx
import React, { useState } from 'react';
import '../styles/Form.css';

const BusForm = () => {
  const [bus, setBus] = useState({
    companyName: '',
    departure: '',
    arrival: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
  });

  const handleChange = (e) => {
    setBus({ ...bus, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission logic (e.g., API call)
    console.log('Bus Data:', bus);
  };

  return (
    <div className="form-container">
      <h2>Add New Bus</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={bus.companyName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Departure Station</label>
          <input
            type="text"
            name="departure"
            value={bus.departure}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Arrival Station</label>
          <input
            type="text"
            name="arrival"
            value={bus.arrival}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Departure Time</label>
          <input
            type="time"
            name="departureTime"
            value={bus.departureTime}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Arrival Time</label>
          <input
            type="time"
            name="arrivalTime"
            value={bus.arrivalTime}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Price ($)</label>
          <input
            type="number"
            name="price"
            value={bus.price}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Add Bus
        </button>
      </form>
    </div>
  );
};

export default BusForm;
