// frontend/src/pages/PaymentPage.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  CircularProgress,
  Container,
  Typography,
  Box,
  Alert,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe with your publishable key from .env file
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

// Initialize Stripe
const stripePromise = loadStripe(stripePublishableKey);

// Define Card Element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
      iconColor: '#aab7c4',
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#9e2146',
    },
  },
};

// Payment Form Component
const PaymentForm = ({ flightDetails, traveler }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create a Payment Intent on the backend
      const amount = Math.round(parseFloat(flightDetails.price.total) * 100); // Convert to cents
      const currency = flightDetails.price.currency.toLowerCase();

      console.log('Creating Payment Intent with amount:', amount, 'and currency:', currency);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error creating payment intent:', errorData);
        throw new Error(errorData?.error || 'Failed to create payment intent.');
      }

      const { clientSecret } = await response.json();
      console.log('Client Secret received:', clientSecret);

      // Step 2: Confirm the Card Payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${traveler.firstName} ${traveler.lastName}`,
            email: traveler.email,
          },
        },
      });

      if (result.error) {
        console.error('Stripe Payment Error:', result.error.message);
        setError(result.error.message);
        setLoading(false);
      } else if (result.paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', result.paymentIntent);

        // Step 3: Create Booking on the backend
        const bookingResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/flights/book-flight`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flightOffer: flightDetails,
            traveler: traveler,
            paymentIntentId: result.paymentIntent.id,
          }),
        });

        if (!bookingResponse.ok) {
          const bookingErrorData = await bookingResponse.json().catch(() => null);
          console.error('Error creating booking:', bookingErrorData);
          throw new Error(bookingErrorData?.error || 'Failed to create booking.');
        }

        const bookingConfirmation = await bookingResponse.json();
        console.log('Booking Confirmation:', bookingConfirmation); // Debugging line

        // Step 4: Navigate to confirmation page with booking data
        navigate('/confirmation', { state: { booking: bookingConfirmation.data } });
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setError(err.message);
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

      {/* Card Details */}
      <Box sx={{ marginBottom: '1.5rem' }}>
        <Typography variant="h6" gutterBottom>
          Enter Your Card Details
        </Typography>
        <Box
          sx={{
            padding: '10px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
          }}
        >
          <CardElement options={CARD_ELEMENT_OPTIONS} />
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
        disabled={!stripe || loading}
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
  const { flightDetails, traveler } = location.state || {};

  if (!flightDetails || !traveler) {
    return (
      <Container maxWidth="sm" sx={{ marginTop: '2rem' }}>
        <Typography variant="h6" align="center" gutterBottom>
          Missing flight or traveler details. Please go back and try again.
        </Typography>
        <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/')}>
          Go to Booking
        </Button>
      </Container>
    );
  }

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
          Amount to be paid: {flightDetails.price.currency.toUpperCase()} {flightDetails.price.total}
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
        <Elements stripe={stripePromise}>
          <PaymentForm flightDetails={flightDetails} traveler={traveler} />
        </Elements>
      </Box>
    </Container>
  );
};

export default PaymentPage;
