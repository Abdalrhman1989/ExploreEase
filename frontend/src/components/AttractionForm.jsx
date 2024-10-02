// src/components/AttractionForm.jsx
import React, { useState } from 'react';
import '../styles/Form.css';

const AttractionForm = () => {
  const [attraction, setAttraction] = useState({
    name: '',
    location: '',
    type: '',
    entryFee: '',
    openingHours: '',
  });

  const handleChange = (e) => {
    setAttraction({ ...attraction, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission logic (e.g., API call)
    console.log('Attraction Data:', attraction);
  };

  return (
    <div className="form-container">
      <h2>Add New Attraction</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Attraction Name</label>
          <input
            type="text"
            name="name"
            value={attraction.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={attraction.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Type</label>
          <input
            type="text"
            name="type"
            value={attraction.type}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Entry Fee ($)</label>
          <input
            type="number"
            name="entryFee"
            value={attraction.entryFee}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Opening Hours</label>
          <input
            type="text"
            name="openingHours"
            value={attraction.openingHours}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Add Attraction
        </button>
      </form>
    </div>
  );
};

export default AttractionForm;
