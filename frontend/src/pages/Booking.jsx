// frontend/src/pages/Booking.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  Container,
  Box,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import PropTypes from 'prop-types';
import airlineMapping from '../utils/airlineMapping'; // Ensure this mapping exists

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flightDetails } = location.state || {};

  console.log('Flight Details:', flightDetails); // Debugging line

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    passportNumber: '',
    issuanceDate: '',
    expiryDate: '',
    issuanceCountry: '',
    nationality: '',
  });

  const [bookingStatus, setBookingStatus] = useState({
    loading: false,
    success: null,
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingStatus({ loading: true, success: null, message: '' });

    try {
      // Basic Frontend Validation
      for (const [key, value] of Object.entries(formData)) {
        if (!value) {
          throw new Error(`Please fill out the ${key} field.`);
        }
      }

      // Ensure flightDetails contains all necessary fields
      const requiredFields = [
        'type',
        'id',
        'source',
        'itineraries',
        'lastTicketingDate',
        'numberOfBookableSeats',
        'oneWay',
        'price',
        'pricingOptions',
        'validatingAirlineCodes',
        'travelerPricings',
      ];

      const missingFields = requiredFields.filter((field) => !(field in flightDetails));
      if (missingFields.length > 0) {
        throw new Error(`Missing flight details fields: ${missingFields.join(', ')}`);
      }

      // Prepare flightOffer as per Amadeus API expectations
      // Exclude 'lastTicketingDateTime' if present
      const { lastTicketingDateTime, ...serializableFlightOffer } = flightDetails;

      console.log('Serializable Flight Offer:', serializableFlightOffer); // Debugging line

      // Step 1: Confirm Flight Pricing
      const confirmResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/flights/confirm-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightOffer: serializableFlightOffer }),
      });

      console.log('Confirm Response Status:', confirmResponse.status); // Debugging line

      if (!confirmResponse.ok) {
        // Attempt to parse error message
        const errorData = await confirmResponse.json().catch(() => null);
        const errorMsg = errorData?.error || 'Failed to confirm flight pricing.';
        throw new Error(errorMsg);
      }
      const confirmedPrice = await confirmResponse.json();

      console.log('Confirmed Price:', confirmedPrice); // Debugging line

      // Step 2: Submit Traveler Information
      const travelerResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/flights/traveler-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('Traveler Response Status:', travelerResponse.status); // Debugging line

      if (!travelerResponse.ok) {
        const errorData = await travelerResponse.json().catch(() => null);
        const errorMsg = errorData?.error || 'Failed to submit traveler information.';
        throw new Error(errorMsg);
      }
      const travelerInfo = await travelerResponse.json();

      console.log('Traveler Info:', travelerInfo); // Debugging line

      // Step 3: Place the Order
      const orderData = {
        flightOffer: serializableFlightOffer,
        confirmedPrice: confirmedPrice.data,
        travelerId: travelerInfo.data.id,
      };

      console.log('Order Data:', orderData); // Debugging line

      const orderResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/flights/book-flight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      console.log('Order Response Status:', orderResponse.status); // Debugging line

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => null);
        const errorMsg = errorData?.error || 'Failed to place flight order.';
        throw new Error(errorMsg);
      }
      const bookingConfirmation = await orderResponse.json();

      console.log('Booking Confirmation:', bookingConfirmation); // Debugging line

      setBookingStatus({ loading: false, success: true, message: 'Booking Confirmed!' });

      // Navigate to confirmation page with booking data
      navigate('/confirmation', { state: { booking: bookingConfirmation.data } });
    } catch (error) {
      console.error('Booking Error:', error);
      setBookingStatus({ loading: false, success: false, message: error.message });
    }
  };

  // Redirect to home if flightDetails is undefined or incomplete
  useEffect(() => {
    if (!flightDetails) {
      navigate('/');
    } else {
      // Check for required fields
      const requiredFields = [
        'type',
        'id',
        'source',
        'itineraries',
        'lastTicketingDate',
        'numberOfBookableSeats',
        'oneWay',
        'price',
        'pricingOptions',
        'validatingAirlineCodes',
        'travelerPricings',
      ];

      const missingFields = requiredFields.filter((field) => !(field in flightDetails));
      if (missingFields.length > 0) {
        console.error('Missing flightDetails fields:', missingFields);
        navigate('/');
      }
    }
  }, [flightDetails, navigate]);

  if (!flightDetails) {
    return null; // Already redirected
  }

  // Ensure itineraries and segments exist
  if (
    !flightDetails.itineraries ||
    !Array.isArray(flightDetails.itineraries) ||
    flightDetails.itineraries.length === 0 ||
    !flightDetails.itineraries[0].segments ||
    !Array.isArray(flightDetails.itineraries[0].segments) ||
    flightDetails.itineraries[0].segments.length === 0
  ) {
    return (
      <Container maxWidth="md" sx={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ marginBottom: '1rem' }}
        >
          Back to Results
        </Button>
        <Typography variant="h6" align="center">
          Invalid flight details. Please try again.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Go to Search
        </Button>
      </Container>
    );
  }

  // Extract flight details from flightDetails.itineraries
  const firstItinerary = flightDetails.itineraries[0];
  const firstSegment = firstItinerary.segments[0];

  const origin = firstSegment.departure?.iataCode || 'N/A';
  const destination = firstSegment.arrival?.iataCode || 'N/A';

  const departureTime = firstSegment.departure?.at
    ? new Date(firstSegment.departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  const arrivalTime = firstSegment.arrival?.at
    ? new Date(firstSegment.arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  // Safely access airlineName and airlineLogo using airlineMapping
  const airlineCode = flightDetails.validatingAirlineCodes[0]; // Assuming the first code
  const airlineInfo = airlineMapping[airlineCode] || {
    name: 'Unknown Airline',
    logo: `https://via.placeholder.com/100?text=${airlineCode}`,
  };

  // Optionally, extract departureDate and arrivalDate from segment
  const departureDate = firstSegment.departure?.at
    ? new Date(firstSegment.departure.at).toLocaleString()
    : 'N/A';

  const arrivalDate = firstSegment.arrival?.at
    ? new Date(firstSegment.arrival.at).toLocaleString()
    : 'N/A';

  return (
    <Container maxWidth="md" sx={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ marginBottom: '1rem' }}
      >
        Back to Results
      </Button>

      <Typography variant="h4" gutterBottom align="center">
        Booking Details
      </Typography>

      <Card sx={{ padding: '2rem', borderRadius: '12px', boxShadow: 3 }}>
        <CardContent>
          {/* Flight Details */}
          <Box sx={{ marginBottom: '2rem' }}>
            <Grid container spacing={2} alignItems="center">
              {/* Airline Logo */}
              <Grid item xs={12} md={4}>
                <Avatar
                  src={airlineInfo.logo}
                  alt={airlineInfo.name}
                  sx={{ width: 100, height: 100, margin: '0 auto' }}
                >
                  {airlineInfo.name.charAt(0)}
                </Avatar>
              </Grid>
              {/* Flight Information */}
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  {airlineInfo.name} {firstSegment.number || 'N/A'}
                </Typography>
                <Typography variant="body1">
                  Route: {origin} → {destination}
                </Typography>
                <Typography variant="body1">
                  Departure: {departureTime} on {departureDate}
                </Typography>
                <Typography variant="body1">
                  Arrival: {arrivalTime} on {arrivalDate}
                </Typography>
                <Typography variant="h6" color="primary">
                  Price: {flightDetails.price.currency} {flightDetails.price.total}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Traveler Information Form */}
          <form onSubmit={handleConfirmBooking}>
            <Grid container spacing={2}>
              {/* First Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>

              {/* Last Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>

              {/* Phone Number */}
              <Grid item xs={12}>
                <TextField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>

              {/* Date of Birth */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>

              {/* Passport Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Passport Number"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>

              {/* Issuance Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Issuance Date"
                  name="issuanceDate"
                  type="date"
                  value={formData.issuanceDate}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>

              {/* Expiry Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>

              {/* Issuance Country */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Issuance Country"
                  name="issuanceCountry"
                  value={formData.issuanceCountry}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                  placeholder="e.g., US"
                  inputProps={{ maxLength: 2 }}
                />
              </Grid>

              {/* Nationality */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                  placeholder="e.g., US"
                  inputProps={{ maxLength: 2 }}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={bookingStatus.loading}
                >
                  {bookingStatus.loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Booking'}
                </Button>
              </Grid>

              {/* Booking Status */}
              {bookingStatus.message && (
                <Grid item xs={12}>
                  <Typography
                    variant="body1"
                    color={bookingStatus.success ? 'green' : 'red'}
                  >
                    {bookingStatus.message}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

// PropTypes for type checking
Booking.propTypes = {
  flightDetails: PropTypes.shape({
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    instantTicketingRequired: PropTypes.bool,
    nonHomogeneous: PropTypes.bool,
    itineraries: PropTypes.arrayOf(PropTypes.object),
    lastTicketingDate: PropTypes.string,
    numberOfBookableSeats: PropTypes.number,
    oneWay: PropTypes.bool,
    price: PropTypes.shape({
      currency: PropTypes.string,
      total: PropTypes.string,
      base: PropTypes.string,
      fees: PropTypes.arrayOf(PropTypes.object),
      grandTotal: PropTypes.string,
    }),
    pricingOptions: PropTypes.shape({
      fareType: PropTypes.arrayOf(PropTypes.string),
      includedCheckedBagsOnly: PropTypes.bool,
    }),
    validatingAirlineCodes: PropTypes.arrayOf(PropTypes.string),
    travelerPricings: PropTypes.arrayOf(PropTypes.object),
  }),
};

export default Booking;
