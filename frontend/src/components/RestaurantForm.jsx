// src/components/RestaurantForm.jsx
import React, { useState } from 'react';
import '../styles/Form.css';

const RestaurantForm = () => {
  const [restaurant, setRestaurant] = useState({
    name: '',
    location: '',
    cuisine: '',
    priceRange: '',
    rating: '',
  });

  const handleChange = (e) => {
    setRestaurant({ ...restaurant, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission logic (e.g., API call)
    console.log('Restaurant Data:', restaurant);
  };

  return (
    <div className="form-container">
      <h2>Add New Restaurant</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Restaurant Name</label>
          <input
            type="text"
            name="name"
            value={restaurant.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={restaurant.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Cuisine</label>
          <input
            type="text"
            name="cuisine"
            value={restaurant.cuisine}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Price Range ($)</label>
          <input
            type="number"
            name="priceRange"
            value={restaurant.priceRange}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Rating</label>
          <input
            type="number"
            name="rating"
            value={restaurant.rating}
            onChange={handleChange}
            min="1"
            max="5"
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Add Restaurant
        </button>
      </form>
    </div>
  );
};

export default RestaurantForm;
