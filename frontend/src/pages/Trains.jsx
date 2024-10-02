// src/pages/Trains.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Banner from '../components/Banner';
import TrendingSection from '../components/TrendingSection';
import Footer from '../components/Footer';
import TrainResults from './TrainResults'; // Create this component similarly to FlightResults
import '../styles/Trains.css';

import trainImage from '../assets/train1.jpg';
import train1 from '../assets/train1.jpg';
import train2 from '../assets/train1.jpg'; // Add more train images as needed
import train3 from '../assets/train1.jpg'; // Add more train images as needed

const Trains = () => {
  const [searchParams, setSearchParams] = useState({
    departure_station: '',
    arrival_station: '',
    departure_date: '',
    limit: 10,
    offset: 0,
  });

  const [trainData, setTrainData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const trendingTrains = [
    { name: "New York to Washington", imageUrl: train1 },
    { name: "Paris to Lyon", imageUrl: train2 },
    { name: "Berlin to Munich", imageUrl: train3 },
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
    setTrainData(null);
    setLoading(true);

    const { departure_station, arrival_station, departure_date, limit, offset } = searchParams;

    // Basic validation
    if (departure_station.length < 2 || arrival_station.length < 2) {
      setError('Please enter valid departure and arrival station codes.');
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
        `http://localhost:3000/api/trains?departure_station=${departure_station}&arrival_station=${arrival_station}&departure_date=${departure_date}&limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error?.message || 'An error occurred while fetching trains.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTrainData(data);
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
    if (trainData) {
      handleSubmit(new Event('submit'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.offset]);

  return (
    <div className="trains">
      <Banner
        title="Find Your Train"
        subtitle="Discover and book trains with ease"
        buttonText="Explore Trains"
        imageUrl={trainImage}
      />

      {/* Search Bar */}
      <section className="search-bar-container">
        <form className="search-bar" onSubmit={handleSubmit} aria-label="Train Search Form">
          <div className="input-group">
            <label htmlFor="departure_station">From:</label>
            <input
              type="text"
              id="departure_station"
              name="departure_station"
              value={searchParams.departure_station}
              onChange={handleChange}
              placeholder="Departure Station (e.g., NY)"
              maxLength="5"
              required
              aria-required="true"
            />
          </div>
          <div className="input-group">
            <label htmlFor="arrival_station">To:</label>
            <input
              type="text"
              id="arrival_station"
              name="arrival_station"
              value={searchParams.arrival_station}
              onChange={handleChange}
              placeholder="Arrival Station (e.g., LN)"
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
          <p>Searching for trains...</p>
        </div>
      )}

      {/* Display Train Results */}
      {trainData && <TrainResults data={trainData} onNext={handleNext} onPrev={handlePrev} />}

      {/* Trending Trains Section */}
      <div className="content-wrapper">
        <TrendingSection title="Trending Trains" items={trendingTrains} />
      </div>
    </div>
  );
};

export default Trains;
