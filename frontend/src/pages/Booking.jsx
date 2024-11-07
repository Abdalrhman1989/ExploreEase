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

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    for (const [key, value] of Object.entries(formData)) {
      if (!value) {
        errors[key] = 'This field is required.';
      }
    }
    // Additional validations can be added here (e.g., email format, phone number format)
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      // Redirect to Payment Page with flightDetails and formData
      navigate('/payment', { state: { flightDetails, traveler: formData } });
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
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
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
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
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
                  error={!!formErrors.email}
                  helperText={formErrors.email}
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
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
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
                  error={!!formErrors.dateOfBirth}
                  helperText={formErrors.dateOfBirth}
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
                  error={!!formErrors.passportNumber}
                  helperText={formErrors.passportNumber}
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
                  error={!!formErrors.issuanceDate}
                  helperText={formErrors.issuanceDate}
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
                  error={!!formErrors.expiryDate}
                  helperText={formErrors.expiryDate}
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
                  error={!!formErrors.issuanceCountry}
                  helperText={formErrors.issuanceCountry}
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
                  error={!!formErrors.nationality}
                  helperText={formErrors.nationality}
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm Booking'}
                </Button>
              </Grid>
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
