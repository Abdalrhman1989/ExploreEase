// src/components/TrainForm.jsx
import React, { useState } from 'react';
import '../styles/Form.css';

const TrainForm = () => {
  const [train, setTrain] = useState({
    name: '',
    departure: '',
    arrival: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
  });

  const handleChange = (e) => {
    setTrain({ ...train, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission logic (e.g., API call)
    console.log('Train Data:', train);
  };

  return (
    <div className="form-container">
      <h2>Add New Train</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Train Name</label>
          <input
            type="text"
            name="name"
            value={train.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Departure Station</label>
          <input
            type="text"
            name="departure"
            value={train.departure}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Arrival Station</label>
          <input
            type="text"
            name="arrival"
            value={train.arrival}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Departure Time</label>
          <input
            type="time"
            name="departureTime"
            value={train.departureTime}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Arrival Time</label>
          <input
            type="time"
            name="arrivalTime"
            value={train.arrivalTime}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Price ($)</label>
          <input
            type="number"
            name="price"
            value={train.price}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Add Train
        </button>
      </form>
    </div>
  );
};

export default TrainForm;
