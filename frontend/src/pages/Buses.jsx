// src/pages/Buses.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Banner from '../components/Banner';
import TrendingSection from '../components/TrendingSection';
import Footer from '../components/Footer';
import BusResults from '../pages/BusResults'; // Create this component similarly to FlightResults
import '../styles/Buses.css';

import busImage from '../assets/bus1.jpg';
import bus1 from '../assets/bus1.jpg';
import bus2 from '../assets/bus1.jpg'; // Add more bus images as needed
import bus3 from '../assets/bus1.jpg'; // Add more bus images as needed

const Buses = () => {
  const [searchParams, setSearchParams] = useState({
    departure_location: '',
    arrival_location: '',
    departure_date: '',
    limit: 10,
    offset: 0,
  });

  const [busData, setBusData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const trendingBuses = [
    { name: "Berlin to Munich", imageUrl: bus1 },
    { name: "Madrid to Barcelona", imageUrl: bus2 },
    { name: "Rome to Florence", imageUrl: bus3 },
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: name.includes('date') ? value : value.toUpperCase(),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusData(null);
    setLoading(true);

    const { departure_location, arrival_location, departure_date, limit, offset } = searchParams;

    // Basic validation
    if (departure_location.length < 2 || arrival_location.length < 2) {
      setError('Please enter valid departure and arrival locations.');
      setLoading(false);
      return;
    }

    if (!departure_date) {
      setError('Please select a departure date.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/buses?departure_location=${departure_location}&arrival_location=${arrival_location}&departure_date=${departure_date}&limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error?.message || 'An error occurred while fetching buses.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setBusData(data);
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
    if (busData) {
      handleSubmit(new Event('submit'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.offset]);

  return (
    <div className="buses">
      <Banner
        title="Find Your Bus"
        subtitle="Discover and book buses with ease"
        buttonText="Explore Buses"
        imageUrl={busImage}
      />

      {/* Search Bar */}
      <section className="search-bar-container">
        <form className="search-bar" onSubmit={handleSubmit} aria-label="Bus Search Form">
          <div className="input-group">
            <label htmlFor="departure_location">From:</label>
            <input
              type="text"
              id="departure_location"
              name="departure_location"
              value={searchParams.departure_location}
              onChange={handleChange}
              placeholder="Departure Location (e.g., BER)"
              maxLength="5"
              required
              aria-required="true"
            />
          </div>
          <div className="input-group">
            <label htmlFor="arrival_location">To:</label>
            <input
              type="text"
              id="arrival_location"
              name="arrival_location"
              value={searchParams.arrival_location}
              onChange={handleChange}
              placeholder="Arrival Location (e.g., MUN)"
              maxLength="5"
              required
              aria-required="true"
            />
          </div>
          <div className="input-group">
            <label htmlFor="departure_date">Departure Date:</label>
            <input
              type="date"
              id="departure_date"
              name="departure_date"
              value={searchParams.departure_date}
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
          <p>Searching for buses...</p>
        </div>
      )}

      {/* Display Bus Results */}
      {busData && <BusResults data={busData} onNext={handleNext} onPrev={handlePrev} />}

      {/* Trending Buses Section */}
      <div className="content-wrapper">
        <TrendingSection title="Trending Buses" items={trendingBuses} />
      </div>
    </div>
  );
};

export default Buses;
