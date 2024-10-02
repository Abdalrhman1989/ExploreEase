// src/pages/Restaurants.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Banner from '../components/Banner';
import TrendingSection from '../components/TrendingSection';
import Footer from '../components/Footer';
import RestaurantResults from '../pages/RestaurantResults'; // Create this component similarly to FlightResults
import '../styles/Restaurants.css';

import restaurantImage from '../assets/Restaurant1.jpg';
import restaurant1 from '../assets/Restaurant1.jpg';
import restaurant2 from '../assets/Restaurant1.jpg'; // Add more restaurant images as needed
import restaurant3 from '../assets/Restaurant1.jpg'; // Add more restaurant images as needed

const Restaurants = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    cuisine: '',
    date: '',
    limit: 10,
    offset: 0,
  });

  const [restaurantData, setRestaurantData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const trendingRestaurants = [
    { name: "Le Gourmet Paris", imageUrl: restaurant1 },
    { name: "Tokyo Sushi", imageUrl: restaurant2 },
    { name: "Berlin Bratwurst", imageUrl: restaurant3 },
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setRestaurantData(null);
    setLoading(true);

    const { location, cuisine, date, limit, offset } = searchParams;

    // Basic validation
    if (location.length < 2) {
      setError('Please enter a valid location.');
      setLoading(false);
      return;
    }

    if (!date) {
      setError('Please select a date.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/restaurants?location=${location}&cuisine=${cuisine}&date=${date}&limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error?.message || 'An error occurred while fetching restaurants.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setRestaurantData(data);
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Pagination
  const handleNext = () => {
    setSearchParams((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  const handlePrev = () => {
    setSearchParams((prev) => ({
      ...prev,
      offset: prev.offset - prev.limit >= 0 ? prev.offset - prev.limit : 0,
    }));
  };

  // Fetch new data when offset changes
  useEffect(() => {
    if (restaurantData) {
      handleSubmit(new Event('submit'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.offset]);

  return (
    <div className="restaurants">
      <Banner
        title="Find Your Restaurant"
        subtitle="Discover and book restaurants with ease"
        buttonText="Explore Restaurants"
        imageUrl={restaurantImage}
      />

      {/* Search Bar */}
      <section className="search-bar-container">
        <form className="search-bar" onSubmit={handleSubmit} aria-label="Restaurant Search Form">
          <div className="input-group">
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={searchParams.location}
              onChange={handleChange}
              placeholder="Enter Location (e.g., NYC)"
              required
              aria-required="true"
            />
          </div>
          <div className="input-group">
            <label htmlFor="cuisine">Cuisine:</label>
            <input
              type="text"
              id="cuisine"
              name="cuisine"
              value={searchParams.cuisine}
              onChange={handleChange}
              placeholder="Enter Cuisine (e.g., Italian)"
            />
          </div>
          <div className="input-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={searchParams.date}
              onChange={handleChange}
              required
              aria-required="true"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="input-group">
            <label htmlFor="limit">Results:</label>
            <input
              type="number"
              id="limit"
              name="limit"
              value={searchParams.limit}
              onChange={handleChange}
              min="1"
              max="100"
              aria-label="Number of results to display"
            />
          </div>
          <button type="submit" className="search-button">Search</button>
        </form>
      </section>

      {/* Display Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Display Loading Indicator */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Searching for restaurants...</p>
        </div>
      )}

      {/* Display Restaurant Results */}
      {restaurantData && <RestaurantResults data={restaurantData} onNext={handleNext} onPrev={handlePrev} />}

      {/* Trending Restaurants Section */}
      <div className="content-wrapper">
        <TrendingSection title="Trending Restaurants" items={trendingRestaurants} />
      </div>
    </div>
  );
};

export default Restaurants;
