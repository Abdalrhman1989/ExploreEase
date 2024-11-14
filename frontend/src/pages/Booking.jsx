// frontend/src/pages/Booking.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import airlineMapping from '../utils/airlineMapping'; 
import PropTypes from 'prop-types';
import { AuthContext } from '../context/AuthContext'; // Ensure you have an AuthContext

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flightDetails } = location.state || {};

  const { isAuthenticated, user } = useContext(AuthContext);

  // Form and Payment States
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
    // Payment Fields
    cardNumber: '',
    expirationDate: '',
    cvv: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [amount, setAmount] = useState(0);
  const [paymentError, setPaymentError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Loading and Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch flight details or redirect if invalid
  useEffect(() => {
    if (!flightDetails) {
      toast.error('No flight details found. Redirecting to home.');
      navigate('/');
    } else {
      // Validate required flightDetails fields
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
        toast.error('Incomplete flight details. Redirecting to home.');
        navigate('/');
      } else {
        // Ensure itineraries and segments exist
        if (
          !flightDetails.itineraries ||
          !Array.isArray(flightDetails.itineraries) ||
          flightDetails.itineraries.length === 0 ||
          !flightDetails.itineraries[0].segments ||
          !Array.isArray(flightDetails.itineraries[0].segments) ||
          flightDetails.itineraries[0].segments.length === 0
        ) {
          toast.error('Invalid flight itinerary. Redirecting to home.');
          navigate('/');
        } else {
          // Calculate amount based on flight price
          setAmount(parseFloat(flightDetails.price.total) || 0);
          setLoading(false);
        }
      }
    }
  }, [flightDetails, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // If certain fields change, you might want to recalculate amount or perform other actions
    if (['issuanceDate', 'expiryDate'].includes(name)) {
      // Example: Additional logic if needed
    }
  };

  const validateForm = () => {
    const errors = {};
    const { firstName, lastName, email, phone, dateOfBirth, passportNumber, issuanceDate, expiryDate, issuanceCountry, nationality } = formData;

    if (!firstName.trim()) errors.firstName = 'First name is required.';
    if (!lastName.trim()) errors.lastName = 'Last name is required.';
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid.';
    }
    if (!phone.trim()) errors.phone = 'Phone number is required.';
    if (!dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';
    if (!passportNumber.trim()) errors.passportNumber = 'Passport number is required.';
    if (!issuanceDate) errors.issuanceDate = 'Issuance date is required.';
    if (!expiryDate) errors.expiryDate = 'Expiry date is required.';
    if (!issuanceCountry.trim()) {
      errors.issuanceCountry = 'Issuance country is required.';
    } else if (issuanceCountry.trim().length < 2 || issuanceCountry.trim().length > 3) {
      errors.issuanceCountry = 'Issuance country code must be 2 or 3 characters.';
    }
    if (!nationality.trim()) {
      errors.nationality = 'Nationality is required.';
    } else if (nationality.trim().length < 2 || nationality.trim().length > 3) {
      errors.nationality = 'Nationality code must be 2 or 3 characters.';
    }

    // Validate Payment Fields (optional for simulation)
    // Since this is a fake payment, you might skip real validation
    if (!formData.cardNumber.trim()) {
      errors.cardNumber = 'Card number is required.';
    } else if (!/^\d{16}$/.test(formData.cardNumber.trim())) {
      errors.cardNumber = 'Card number must be 16 digits.';
    }

    if (!formData.expirationDate.trim()) {
      errors.expirationDate = 'Expiration date is required.';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expirationDate.trim())) {
      errors.expirationDate = 'Expiration date must be in MM/YY format.';
    }

    if (!formData.cvv.trim()) {
      errors.cvv = 'CVV is required.';
    } else if (!/^\d{3}$/.test(formData.cvv.trim())) {
      errors.cvv = 'CVV must be 3 digits.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setIsSubmitting(true);
    setPaymentError(null);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

      // Extract necessary flight details from flightDetails
      const firstItinerary = flightDetails.itineraries[0];
      const firstSegment = firstItinerary.segments[0];

      const flightNumber = firstSegment.number || 'N/A';
      const departureAirport = firstSegment.departure?.iataCode || 'N/A';
      const arrivalAirport = firstSegment.arrival?.iataCode || 'N/A';
      const departureTime = firstSegment.departure?.at || new Date().toISOString();
      const arrivalTime = firstSegment.arrival?.at || new Date().toISOString();
      const seatClass = firstSegment.cabin || 'Economy';

      // Create Flight Booking
      const bookingResponse = await axios.post(
        `${backendUrl}/api/flight-bookings`,
        {
          // Traveler Information
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          passportNumber: formData.passportNumber,
          issuanceDate: formData.issuanceDate,
          expiryDate: formData.expiryDate,
          issuanceCountry: formData.issuanceCountry,
          nationality: formData.nationality,
          // Flight Details
          flightNumber,
          departureAirport,
          arrivalAirport,
          departureTime,
          arrivalTime,
          seatClass,
          price: parseFloat(flightDetails.price.total),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (bookingResponse.status === 201 && bookingResponse.data.success) {
        const bookingId = bookingResponse.data.flightBooking.FlightBookingID;
        const bookingAmount = parseFloat(flightDetails.price.total) * 100; // Assuming price is in USD and converting to cents

        // Simulate Payment
        const paymentResponse = await axios.post(
          `${backendUrl}/api/payments/simulate-payment`,
          { bookingId,bookingType: 'flight', amount: bookingAmount },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }
        );

        if (paymentResponse.status === 200 && paymentResponse.data.success) {
          // Fetch confirmed booking details if needed
          const confirmedBooking = bookingResponse.data.flightBooking;
          setBookingDetails({
            bookingId: confirmedBooking.FlightBookingID,
            flightNumber: confirmedBooking.flightNumber,
            departureAirport: confirmedBooking.departureAirport,
            arrivalAirport: confirmedBooking.arrivalAirport,
            departureTime: confirmedBooking.departureTime,
            arrivalTime: confirmedBooking.arrivalTime,
            seatClass: confirmedBooking.seatClass,
            price: confirmedBooking.price,
            firstName: confirmedBooking.firstName,
            lastName: confirmedBooking.lastName,
            email: confirmedBooking.email,
            phone: confirmedBooking.phone,
          });

          // Open Confirmation Dialog
          setOpenDialog(true);

          // Reset Form
          setFormData({
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
            cardNumber: '',
            expirationDate: '',
            cvv: '',
          });
          setAmount(0);

          toast.success('Booking and payment successful! Confirmation email sent.');
        } else {
          setPaymentError(paymentResponse.data.message || 'Payment failed.');
          toast.error(paymentResponse.data.message || 'Payment failed.');
        }
      } else {
        setPaymentError(bookingResponse.data.message || 'Booking failed.');
        toast.error(bookingResponse.data.message || 'Booking failed.');
      }
    } catch (err) {
      console.error('Error during booking or payment:', err);
      setPaymentError(err.response?.data?.message || 'Booking or payment failed. Please try again.');
      toast.error(err.response?.data?.message || 'Booking or payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setBookingDetails(null);
    navigate('/'); // Redirect to home or booking history as needed
  };

  if (loading) return <LoadingSpinner />;
  if (!flightDetails) return null; // Already handled in useEffect

  // Extract flight details
  const { itineraries, validatingAirlineCodes, price } = flightDetails;
  const firstItinerary = itineraries[0];
  const firstSegment = firstItinerary.segments[0];

  const origin = firstSegment.departure?.iataCode || 'N/A';
  const destination = firstSegment.arrival?.iataCode || 'N/A';

  const departureTime = firstSegment.departure?.at
    ? new Date(firstSegment.departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  const arrivalTime = firstSegment.arrival?.at
    ? new Date(firstSegment.arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  // Airline Information
  const airlineCode = validatingAirlineCodes[0] || 'NA';
  const airlineInfo = airlineMapping[airlineCode] || {
    name: 'Unknown Airline',
    logo: `https://via.placeholder.com/100?text=${airlineCode}`,
  };

  // Optional: Extract departureDate and arrivalDate from segment
  const departureDate = firstSegment.departure?.at
    ? new Date(firstSegment.departure.at).toLocaleString()
    : 'N/A';

  const arrivalDate = firstSegment.arrival?.at
    ? new Date(firstSegment.arrival.at).toLocaleString()
    : 'N/A';

  return (
    <Container maxWidth="md" sx={{ marginTop: '2rem', marginBottom: '2rem' }}>
      {/* Toast Container for Notifications */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />

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

      <Card sx={{ padding: '2rem', borderRadius: '12px', boxShadow: 3, marginBottom: '2rem' }}>
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
                  Price: {price.currency} {price.total}
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
                  inputProps={{ maxLength: 3 }}
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
                  inputProps={{ maxLength: 3 }}
                  error={!!formErrors.nationality}
                  helperText={formErrors.nationality}
                />
              </Grid>

              {/* Payment Section */}
              <Grid item xs={12}>
                <Box sx={{ marginTop: '2rem' }}>
                  <Typography variant="h6" gutterBottom>
                    Enter Your Payment Details (Fake Payment)
                  </Typography>
                  <Box
                    sx={{
                      padding: '10px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      marginBottom: '1rem',
                    }}
                  >
                    <Typography variant="body1">
                      Since this is a fake payment, please enter any dummy card information.
                    </Typography>

                    {/* Payment Inputs */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                      <TextField
                        label="Card Number"
                        name="cardNumber"
                        type="text"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        variant="outlined"
                        fullWidth
                        required
                        inputProps={{ maxLength: 16 }}
                        error={!!formErrors.cardNumber}
                        helperText={formErrors.cardNumber}
                      />
                      <Box sx={{ display: 'flex', gap: '1rem' }}>
                        <TextField
                          label="Expiration Date (MM/YY)"
                          name="expirationDate"
                          type="text"
                          value={formData.expirationDate}
                          onChange={handleChange}
                          variant="outlined"
                          fullWidth
                          required
                          inputProps={{ maxLength: 5 }}
                          error={!!formErrors.expirationDate}
                          helperText={formErrors.expirationDate}
                        />
                        <TextField
                          label="CVV"
                          name="cvv"
                          type="text"
                          value={formData.cvv}
                          onChange={handleChange}
                          variant="outlined"
                          fullWidth
                          required
                          inputProps={{ maxLength: 3 }}
                          error={!!formErrors.cvv}
                          helperText={formErrors.cvv}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Supported Card Logos */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                      alt="Visa"
                      width={50}
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                      alt="MasterCard"
                      width={50}
                    />
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYol8jEyLTlI4Fl3hgJLSmFdAsNsHYOTjnhSxQ1d9p7y9QGjGTa5JaPSUXL2M6HuCgDyY&usqp=CAU"
                      alt="American Express"
                      width={50}
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Payment Error Alert */}
              {paymentError && (
                <Grid item xs={12}>
                  <Alert severity="error">{paymentError}</Alert>
                </Grid>
              )}

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

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title">Booking Confirmed!</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description">
            <Typography variant="body1" gutterBottom>
              Thank you, <strong>{bookingDetails?.firstName} {bookingDetails?.lastName}</strong>, for booking with us!
            </Typography>
            <Typography variant="body2" gutterBottom>
              Your booking ID is <strong>{bookingDetails?.bookingId}</strong>.
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Flight Number:</strong> {bookingDetails?.flightNumber}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>From:</strong> {bookingDetails?.departureAirport} at {new Date(bookingDetails?.departureTime).toLocaleString()}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>To:</strong> {bookingDetails?.arrivalAirport} at {new Date(bookingDetails?.arrivalTime).toLocaleString()}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Seat Class:</strong> {bookingDetails?.seatClass}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Price:</strong> USD {bookingDetails?.price}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Contact Email:</strong> {bookingDetails?.email}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Contact Phone:</strong> {bookingDetails?.phone}
            </Typography>
            <Typography variant="body2" gutterBottom>
              A confirmation email has been sent to <strong>{bookingDetails?.email}</strong>.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Helper Components

const LoadingSpinner = () => (
  <Container
    maxWidth="sm"
    sx={{
      marginTop: '3rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <CircularProgress />
    <Typography variant="h6" sx={{ marginTop: '1rem' }}>
      Loading booking form...
    </Typography>
  </Container>
);

const ErrorMessage = ({ error }) => (
  <Container
    maxWidth="sm"
    sx={{
      marginTop: '3rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <Alert severity="error">{error}</Alert>
  </Container>
);

const NoFlightMessage = () => (
  <Container
    maxWidth="sm"
    sx={{
      marginTop: '3rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <Alert severity="warning">No flight details available.</Alert>
  </Container>
);

// PropTypes for type checking
Booking.propTypes = {
  flightDetails: PropTypes.shape({
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    itineraries: PropTypes.arrayOf(
      PropTypes.shape({
        segments: PropTypes.arrayOf(PropTypes.object),
      })
    ).isRequired,
    lastTicketingDate: PropTypes.string,
    numberOfBookableSeats: PropTypes.number,
    oneWay: PropTypes.bool,
    price: PropTypes.shape({
      currency: PropTypes.string,
      total: PropTypes.string,
      base: PropTypes.string,
      fees: PropTypes.arrayOf(PropTypes.object),
      grandTotal: PropTypes.string,
    }).isRequired,
    pricingOptions: PropTypes.shape({
      fareType: PropTypes.arrayOf(PropTypes.string),
      includedCheckedBagsOnly: PropTypes.bool,
    }),
    validatingAirlineCodes: PropTypes.arrayOf(PropTypes.string),
    travelerPricings: PropTypes.arrayOf(PropTypes.object),
  }),
};

export default Booking;
