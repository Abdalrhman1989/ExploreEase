// frontend/src/pages/Booking.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
} from '@mui/material';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flightDetails } = location.state || {};

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

  if (!flightDetails) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Typography variant="h6">No flight details provided.</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Go to Search
        </Button>
      </div>
    );
  }

  const handleConfirmBooking = async (e) => {
    e.preventDefault(); // Prevent form submission

    // Basic form validation (optional)
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.dateOfBirth ||
      !formData.passportNumber ||
      !formData.issuanceDate ||
      !formData.expiryDate ||
      !formData.issuanceCountry ||
      !formData.nationality
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/book-flight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightOffer: flightDetails, // Pass flight details
          travelers: [
            {
              id: '1',
              dateOfBirth: formData.dateOfBirth,
              name: {
                firstName: formData.firstName,
                lastName: formData.lastName,
              },
              contact: {
                emailAddress: formData.email,
                phones: [
                  {
                    deviceType: 'MOBILE',
                    countryCallingCode: '1', // Replace with country code if needed
                    number: formData.phone,
                  },
                ],
              },
              documents: [
                {
                  documentType: 'PASSPORT',
                  number: formData.passportNumber,
                  issuanceDate: formData.issuanceDate,
                  expiryDate: formData.expiryDate,
                  issuanceCountry: formData.issuanceCountry,
                  nationality: formData.nationality,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book the flight');
      }

      const bookingConfirmation = await response.json();
      console.log('Booking Confirmation:', bookingConfirmation);
      alert('Booking Confirmed!');
      navigate('/'); // Redirect to home or confirmation page
    } catch (error) {
      console.error('Booking Error:', error);
      alert(`An error occurred while booking the flight: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Booking Details
      </Typography>
      <Card>
        <Grid container>
          <Grid item xs={12} md={4}>
            <CardMedia
              component="img"
              image={flightDetails.airlineLogo}
              alt={`${flightDetails.airlineName} logo`}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <CardContent>
              <Typography variant="h5">
                {flightDetails.airlineName} {flightDetails.flightNumber}
              </Typography>
              <Typography variant="body1">
                Route: {flightDetails.origin} → {flightDetails.destination}
              </Typography>
              <Typography variant="body1">
                Departure: {new Date(flightDetails.departureTime).toLocaleString()}
              </Typography>
              <Typography variant="body1">
                Arrival: {new Date(flightDetails.arrivalTime).toLocaleString()}
              </Typography>
              <Typography variant="h6" color="primary">
                Price: {flightDetails.price.currency} {flightDetails.price.total}
              </Typography>

              {/* Passenger Details Form */}
              <form style={{ marginTop: '20px' }} onSubmit={handleConfirmBooking}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name"
                      variant="outlined"
                      fullWidth
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name"
                      variant="outlined"
                      fullWidth
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Date of Birth"
                      variant="outlined"
                      type="date"
                      fullWidth
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({ ...formData, dateOfBirth: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Passport Number"
                      variant="outlined"
                      fullWidth
                      required
                      value={formData.passportNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, passportNumber: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Issuance Date"
                      variant="outlined"
                      type="date"
                      fullWidth
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={formData.issuanceDate}
                      onChange={(e) =>
                        setFormData({ ...formData, issuanceDate: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Expiry Date"
                      variant="outlined"
                      type="date"
                      fullWidth
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryDate: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Issuance Country"
                      variant="outlined"
                      fullWidth
                      required
                      value={formData.issuanceCountry}
                      onChange={(e) =>
                        setFormData({ ...formData, issuanceCountry: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nationality"
                      variant="outlined"
                      fullWidth
                      required
                      value={formData.nationality}
                      onChange={(e) =>
                        setFormData({ ...formData, nationality: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      variant="outlined"
                      type="email"
                      fullWidth
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      variant="outlined"
                      type="tel"
                      fullWidth
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  style={{ marginTop: '20px' }}
                >
                  Confirm Booking
                </Button>
              </form>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </div>
  );
};

export default Booking;
