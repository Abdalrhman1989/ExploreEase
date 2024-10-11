// frontend/src/pages/Confirmation.jsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
} from '@mui/material';
import PropTypes from 'prop-types';

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = location.state || {};

  console.log('Booking Details:', booking); // Debugging line

  if (!booking) {
    return (
      <Container maxWidth="md" sx={{ marginTop: '2rem' }}>
        <Typography variant="h6" align="center">
          No booking details available.
        </Typography>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Go to Search
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <Card sx={{ padding: '2rem', borderRadius: '12px', boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Booking Confirmed!
          </Typography>

          <Typography variant="h6" gutterBottom>
            Booking Reference: {booking.id}
          </Typography>

          {/* Flight Details */}
          <Box sx={{ marginBottom: '1.5rem' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={2}>
                <Avatar
                  src={booking.flightOffer.airlineLogo}
                  alt={booking.flightOffer.airlineName}
                  sx={{ width: 56, height: 56 }}
                >
                  {booking.flightOffer.airlineName.charAt(0)}
                </Avatar>
              </Grid>
              <Grid item xs={12} md={10}>
                <Typography variant="h6">{booking.flightOffer.airlineName}</Typography>
                <Typography variant="body1">
                  Flight Number: {booking.flightOffer.flightNumber || 'N/A'}
                </Typography>
                <Typography variant="body1">
                  Route: {booking.flightOffer.originLocationCode} → {booking.flightOffer.destinationLocationCode}
                </Typography>
                <Typography variant="body1">
                  Departure: {new Date(booking.flightOffer.departureDate).toLocaleString()}
                </Typography>
                <Typography variant="body1">
                  Arrival: {new Date(booking.flightOffer.arrivalDate).toLocaleString()}
                </Typography>
                <Typography variant="body1">
                  Price: {booking.flightOffer.price.currency} {booking.flightOffer.price.total}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Traveler Information */}
          <Box sx={{ marginBottom: '1.5rem' }}>
            <Typography variant="h6" gutterBottom>
              Traveler Information
            </Typography>
            <Typography variant="body1">
              Name: {booking.traveler.firstName} {booking.traveler.lastName}
            </Typography>
            <Typography variant="body1">Email: {booking.traveler.email}</Typography>
            <Typography variant="body1">Phone: {booking.traveler.phone}</Typography>
            <Typography variant="body1">
              Date of Birth: {new Date(booking.traveler.dateOfBirth).toLocaleDateString()}
            </Typography>
            <Typography variant="body1">Passport Number: {booking.traveler.passportNumber}</Typography>
            <Typography variant="body1">
              Issuance Date: {new Date(booking.traveler.issuanceDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              Expiry Date: {new Date(booking.traveler.expiryDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body1">Issuance Country: {booking.traveler.issuanceCountry}</Typography>
            <Typography variant="body1">Nationality: {booking.traveler.nationality}</Typography>
          </Box>

          {/* Booking Details */}
          <Box sx={{ marginBottom: '1.5rem' }}>
            <Typography variant="h6" gutterBottom>
              Booking Details
            </Typography>
            <Typography variant="body1">Order ID: {booking.id}</Typography>
            <Typography variant="body1">
              Booking Time: {new Date(booking.createdAt).toLocaleString()}
            </Typography>
            {/* Add more booking details as needed */}
          </Box>

          <Box display="flex" justifyContent="center" mt={4}>
            <Button variant="contained" color="primary" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

// PropTypes for type checking
Confirmation.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.string.isRequired,
    amadeusOrderId: PropTypes.string,
    flightOffer: PropTypes.shape({
      id: PropTypes.string,
      airlineName: PropTypes.string,
      airlineLogo: PropTypes.string,
      flightNumber: PropTypes.string,
      originLocationCode: PropTypes.string,
      destinationLocationCode: PropTypes.string,
      departureDate: PropTypes.string,
      arrivalDate: PropTypes.string,
      price: PropTypes.shape({
        currency: PropTypes.string,
        total: PropTypes.string,
      }),
    }),
    confirmedPrice: PropTypes.object,
    travelerId: PropTypes.string,
    createdAt: PropTypes.string,
    traveler: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string,
      dateOfBirth: PropTypes.string,
      passportNumber: PropTypes.string,
      issuanceDate: PropTypes.string,
      expiryDate: PropTypes.string,
      issuanceCountry: PropTypes.string,
      nationality: PropTypes.string,
    }),
  }),
};

export default Confirmation;
