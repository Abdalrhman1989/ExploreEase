import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PuffLoader } from 'react-spinners';
import '../styles/Flights.css';

import Banner from '../components/Banner';
import TrendingSection from '../components/TrendingSection';
import Testimonials from '../components/Testimonials';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';
import FAQs from '../components/FAQs';

import flightImage from '../assets/flight.jpg';
import flight1 from '../assets/flight1.jpg';
import flight2 from '../assets/flight2.jpg';
import flight3 from '../assets/flight3.jpg';

const Flights = () => {
  const navigate = useNavigate();

  const [tripType, setTripType] = useState('roundTrip');
  const [searchParams, setSearchParams] = useState({
    originLocationCode: '',
    destinationLocationCode: '',
    departureDate: null,
    returnDate: null,
    adults: 1,
    youths: 0,
    children: 0,
    infants: 0,
    travelClass: 'ECONOMY',
    carryOnBags: 0,
    checkedBags: 0,
    max: 50, // Default to 50 results
    currencyCode: 'USD',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const trendingFlights = [
    { name: "New York to London", imageUrl: flight1 },
    { name: "Los Angeles to Tokyo", imageUrl: flight2 },
    { name: "Paris to Sydney", imageUrl: flight3 },
  ];

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: name === 'adults' || name === 'youths' || name === 'children' || name === 'infants' || name === 'carryOnBags' || name === 'checkedBags' || name === 'max'
        ? parseInt(value) || 0
        : value.toUpperCase(),
    }));
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setSearchParams((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      youths,
      children,
      infants,
      travelClass,
      carryOnBags,
      checkedBags,
      max,
      currencyCode,
    } = searchParams;

    // Basic client-side validation
    if (!originLocationCode || originLocationCode.length !== 3) {
      setError('Please enter a valid 3-letter Origin IATA code.');
      return;
    }

    if (!destinationLocationCode || destinationLocationCode.length !== 3) {
      setError('Please enter a valid 3-letter Destination IATA code.');
      return;
    }

    if (!departureDate) {
      setError('Please select a valid Departure Date.');
      return;
    }

    if (tripType === 'roundTrip' && !returnDate) {
      setError('Please select a valid Return Date.');
      return;
    }

    if (adults < 1) {
      setError('Number of adults must be at least 1.');
      return;
    }

    const searchPayload = {
      originLocationCode: originLocationCode.toUpperCase(),
      destinationLocationCode: destinationLocationCode.toUpperCase(),
      departureDate: departureDate.toISOString().split('T')[0],
      returnDate: tripType === 'roundTrip' ? returnDate.toISOString().split('T')[0] : undefined,
      adults,
      youths,
      children,
      infants,
      travelClass,
      carryOnBags,
      checkedBags,
      max,
      currencyCode,
    };

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/flights/search-flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.errors ? data.errors.map(err => err.msg).join(', ') : 'An error occurred while fetching flights.');
        setLoading(false);
        return;
      }

      // Navigate to FlightResults page with search data
      navigate('/results', { state: { searchParams: searchPayload, flightData: data } });
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flights">
      {/* Banner Section */}
      <Banner 
        title="Compare and Book Cheap Flights with Ease" 
        subtitle="Discover your next dream destination" 
        buttonText="Start Searching"
        imageUrl={flightImage}
      />
      
      {/* Flight Search Form */}
      <section className="search-bar-container">
        <form className="search-form" onSubmit={handleSubmit} aria-label="Flight Search Form">
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={tripType}
              onChange={(e) => setTripType(e.target.value)}
            >
              <FormControlLabel
                value="roundTrip"
                control={<Radio />}
                label="Round Trip"
              />
              <FormControlLabel
                value="oneWay"
                control={<Radio />}
                label="One Way"
              />
              <FormControlLabel
                value="multiCity"
                control={<Radio />}
                label="Multi-City"
                disabled
              />
            </RadioGroup>
          </FormControl>

          <div className="form-row">
            <TextField
              label="From"
              name="originLocationCode"
              value={searchParams.originLocationCode}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              placeholder="e.g., JFK"
              inputProps={{ maxLength: 3 }}
            />
            <TextField
              label="To"
              name="destinationLocationCode"
              value={searchParams.destinationLocationCode}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              placeholder="e.g., LAX"
              inputProps={{ maxLength: 3 }}
            />
          </div>

          <div className="form-row">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Departure Date"
                value={searchParams.departureDate}
                onChange={(date) => handleDateChange('departureDate', date)}
                renderInput={(params) => <TextField {...params} required fullWidth margin="normal" />}
              />
              {tripType === 'roundTrip' && (
                <DatePicker
                  label="Return Date"
                  value={searchParams.returnDate}
                  onChange={(date) => handleDateChange('returnDate', date)}
                  renderInput={(params) => <TextField {...params} required fullWidth margin="normal" />}
                />
              )}
            </LocalizationProvider>
          </div>

          <div className="form-row">
            <TextField
              label="Adults (18+)"
              name="adults"
              type="number"
              value={searchParams.adults}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              inputProps={{ min: 1, max: 3 }}
            />
            <TextField
              label="Youths (12-17)"
              name="youths"
              type="number"
              value={searchParams.youths}
              onChange={handleChange}
              fullWidth
              margin="normal"
              inputProps={{ min: 0, max: 3 }}
            />
          </div>
          
          <div className="form-row">
            <TextField
              label="Children (2-11)"
              name="children"
              type="number"
              value={searchParams.children}
              onChange={handleChange}
              fullWidth
              margin="normal"
              inputProps={{ min: 0, max: 3 }}
            />
            <TextField
              label="Infants (under 2)"
              name="infants"
              type="number"
              value={searchParams.infants}
              onChange={handleChange}
              fullWidth
              margin="normal"
              inputProps={{ min: 0, max: 3 }}
            />
          </div>

          <div className="form-row">
            <FormControl fullWidth margin="normal">
              <InputLabel id="travelClass-label">Class</InputLabel>
              <Select
                labelId="travelClass-label"
                name="travelClass"
                value={searchParams.travelClass}
                onChange={handleChange}
              >
                <MenuItem value="ECONOMY">Economy</MenuItem>
                <MenuItem value="PREMIUM_ECONOMY">Premium Economy</MenuItem>
                <MenuItem value="BUSINESS">Business</MenuItem>
                <MenuItem value="FIRST">First Class</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Carry-on Bags"
              name="carryOnBags"
              type="number"
              value={searchParams.carryOnBags}
              onChange={handleChange}
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Checked Bags"
              name="checkedBags"
              type="number"
              value={searchParams.checkedBags}
              onChange={handleChange}
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
            />
          </div>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="search-button"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Flights'}
          </Button>
        </form>
      </section>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading Indicator */}
      {loading && (
        <div className="loading-indicator">
          <PuffLoader size={60} color="#3f51b5" />
          <p>Searching for flights...</p>
        </div>
      )}

      {/* Other sections */}
      <div className="content-wrapper">
        <TrendingSection title="Popular Flights Near You" items={trendingFlights} />
      </div>
      <HowItWorks />
      <FAQs />
    </div>
  );
};

export default Flights;
