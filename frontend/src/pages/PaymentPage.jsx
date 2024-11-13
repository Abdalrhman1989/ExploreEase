// src/pages/PaymentPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  CircularProgress,
  Container,
  Typography,
  Box,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

// Payment Form Component
const PaymentForm = ({ bookingId, amount }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext); // Access AuthContext
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

      // Send payment data to backend
      const response = await axios.post(
        `${backendUrl}/api/payments/fake-payment`,
        { bookingId, amount },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        toast.success('Payment successful! Your booking is confirmed.');
        // Redirect to confirmation page
        navigate('/confirmation', { state: { bookingId } });
      } else {
        toast.error(response.data.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Supported Card Logos */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
          alt="Visa"
          width={50}
          style={{ objectFit: 'contain' }}
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
          alt="MasterCard"
          width={50}
          style={{ objectFit: 'contain' }}
        />
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYol8jEyLTlI4Fl3hgJLSmFdAsNsHYOTjnhSxQ1d9p7y9QGjGTa5JaPSUXL2M6HuCgDyY&usqp=CAU"
          alt="American Express"
          width={50}
          style={{ objectFit: 'contain' }}
        />
        {/* Add more logos as needed */}
      </Box>

      {/* Fake Payment Details */}
      <Box sx={{ marginBottom: '1.5rem' }}>
        <Typography variant="h6" gutterBottom>
          Enter Your Payment Details (Fake Payment)
        </Typography>
        <Box
          sx={{
            padding: '10px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
          }}
        >
          <Typography variant="body1">
            Since this is a fake payment, please enter any dummy card information.
          </Typography>
          {/* Optionally, add input fields for card details */}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ marginBottom: '1.5rem' }}>
          {error}
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        size="large"
        sx={{
          height: '3rem',
          textTransform: 'none',
          fontSize: '1rem',
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Pay Now'}
      </Button>
    </form>
  );
};

// Main Payment Page Component
const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { bookingId } = location.state || {};
  const { isAuthenticated } = useContext(AuthContext); // Access AuthContext

  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [errorBooking, setErrorBooking] = useState(null);

  useEffect(() => {
    if (!bookingId) {
      toast.error('Missing booking details. Please go back and try again.');
      navigate('/');
      return;
    }

    const fetchBooking = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
        const response = await axios.get(`${backendUrl}/api/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (response.status === 200 && response.data.booking) {
          setBooking(response.data.booking);
        } else {
          setErrorBooking('Failed to fetch booking details.');
          toast.error('Failed to fetch booking details.');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setErrorBooking('An error occurred while fetching booking details.');
        toast.error('An error occurred while fetching booking details.');
      } finally {
        setLoadingBooking(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  // Calculate amount based on booking details
  const calculateAmount = () => {
    if (!booking) return 0;

    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const timeDiff = checkOutDate - checkInDate;
    const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Example room prices
    const roomPrices = {
      'Single': 100,
      'Double': 150,
      'Suite': 200,
    };

    const pricePerNight = roomPrices[booking.roomType] || 100;
    return numberOfNights * pricePerNight;
  };

  if (!bookingId) {
    return (
      <Container maxWidth="sm" sx={{ marginTop: '2rem' }}>
        <Typography variant="h6" align="center" gutterBottom>
          Missing booking details. Please go back and try again.
        </Typography>
        <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/')}>
          Go to Home
        </Button>
      </Container>
    );
  }

  if (loadingBooking) {
    return (
      <Container maxWidth="sm" sx={{ marginTop: '2rem', textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" align="center" gutterBottom>
          Loading booking details...
        </Typography>
      </Container>
    );
  }

  if (errorBooking) {
    return (
      <Container maxWidth="sm" sx={{ marginTop: '2rem', textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          {errorBooking}
        </Typography>
        <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/')}>
          Go to Home
        </Button>
      </Container>
    );
  }

  const amount = calculateAmount(); // amount in dollars

  return (
    <Container
      maxWidth="sm"
      sx={{
        marginTop: '3rem',
        marginBottom: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', marginBottom: '2rem', width: '100%' }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
          Complete Your Payment
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Amount to be paid: USD ${amount.toFixed(2)}
        </Typography>
      </Box>

      {/* Payment Form Container */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: 3,
          [theme.breakpoints.down('sm')]: {
            padding: '1.5rem',
          },
        }}
      >
        <PaymentForm bookingId={bookingId} amount={amount} />
      </Box>
    </Container>
  );
};

export default PaymentPage;
