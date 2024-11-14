// frontend/src/pages/HotelBook.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/HotelBook.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toast
import { AuthContext } from '../context/AuthContext';
import {
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert,
  Container,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

const HotelBook = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form and Payment States
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: 'Single', // Default value or as required
  });
  const [amount, setAmount] = useState(0);
  const [paymentError, setPaymentError] = useState(null);

  // Confirmation Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    fetchHotelDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.get(`${backendUrl}/api/hotels/${id}`);
      setHotel(response.data.hotel);
    } catch (err) {
      setError('Failed to fetch hotel details.');
      toast.error('Failed to fetch hotel details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'checkIn' || name === 'checkOut') {
      calculateAmount({ ...formData, [name]: value });
    }
  };

  const calculateAmount = (data) => {
    const { checkIn, checkOut } = data;
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 3600 * 24));
      if (numberOfNights > 0 && hotel?.basePrice) {
        setAmount(numberOfNights * hotel.basePrice);
      } else {
        setAmount(0);
      }
    } else {
      setAmount(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { checkIn, checkOut, email, fullName, roomType } = formData;
    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error('Check-Out date must be after Check-In date.');
      return;
    }
    if (amount <= 0) {
      toast.error('Please select valid Check-In and Check-Out dates.');
      return;
    }

    setSubmitting(true);
    setPaymentError(null);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

      // Create Booking
      const bookingResponse = await axios.post(
        `${backendUrl}/api/bookings`,
        { hotelId: id, ...formData },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );

      console.log('Booking Response:', bookingResponse.data);

      if (bookingResponse.status === 201 && bookingResponse.data.success) {
        // Extract Booking ID
        const bookingId = bookingResponse.data.booking?.BookingID || bookingResponse.data.booking?.id;

        if (!bookingId) {
          throw new Error('Booking ID not found in the response.');
        }

        console.log("Booking ID:", bookingId);
        console.log("Amount:", amount);

        // Convert amount to cents (assuming 'amount' is in dollars)
        const amountInCents = Math.round(amount * 100);

        // Simulate Payment
        const paymentResponse = await axios.post(
          `${backendUrl}/api/payments/simulate-payment`,
          { bookingId, amount: amountInCents, bookingType: 'hotel' }, // <-- Added bookingType and amount conversion
          { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
        );

        console.log('Payment Response:', paymentResponse.data);

        if (paymentResponse.status === 200 && paymentResponse.data.success) {
          // Fetch Booking Details to Display in Confirmation
          const confirmedBooking = bookingResponse.data.booking;
          setBookingDetails({
            bookingId: bookingId,
            hotelName: hotel.name,
            checkIn: confirmedBooking.checkIn,
            checkOut: confirmedBooking.checkOut,
            guests: confirmedBooking.guests,
            roomType: confirmedBooking.roomType, // Include roomType

            amount: (paymentResponse.data.payment.amount / 100).toFixed(2),
            paymentMethod: paymentResponse.data.payment.paymentMethod,
            receiptUrl: paymentResponse.data.payment.receiptUrl,
            fullName: confirmedBooking.fullName, // Ensure fullName is included
          });

          // Open Confirmation Dialog
          setOpenDialog(true);

          // Reset Form
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            checkIn: '',
            checkOut: '',
            guests: 1,
            roomType: 'Single', // Reset roomType as well
          });
          setAmount(0);

          toast.success('Booking and payment successful! Confirmation email sent.');
        } else {
          toast.error(paymentResponse.data.message || 'Payment failed.');
        }
      } else {
        toast.error(bookingResponse.data.message || 'Booking failed.');
      }
    } catch (err) {
      console.error('Error during booking or payment:', err);
      setPaymentError('Booking or payment failed. Please try again.');
      toast.error('Booking or payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setBookingDetails(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!hotel) return <NoHotelMessage />;

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
      {/* Toast Container for Notifications */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />

      <Box sx={{ textAlign: 'center', marginBottom: '2rem', width: '100%' }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
          Book Your Stay at {hotel.name}
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Total Amount: USD ${amount.toFixed(2)}
        </Typography>
      </Box>

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
        <form className="booking-form" onSubmit={handleSubmit}>
          <FormGroup
            id="fullName"
            label="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <FormGroup
            id="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <FormGroup
            id="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <FormGroup
            id="checkIn"
            label="Check-In Date"
            type="date"
            value={formData.checkIn}
            onChange={handleChange}
            required
          />
          <FormGroup
            id="checkOut"
            label="Check-Out Date"
            type="date"
            value={formData.checkOut}
            onChange={handleChange}
            required
          />
          <FormGroup
            id="guests"
            label="Number of Guests"
            type="number"
            value={formData.guests}
            onChange={handleChange}
            required
          />
          <FormGroup
            id="roomType"
            label="Room Type"
            value={formData.roomType}
            onChange={handleChange}
            required
            type="select"
          >
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Suite">Suite</option>
            {/* Add other room types as needed */}
          </FormGroup>

          {/* Payment Section */}
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
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Card Number"
                  maxLength="16"
                  className="payment-input"
                  required
                />
                <Box sx={{ display: 'flex', gap: '1rem' }}>
                  <input
                    type="text"
                    name="expirationDate"
                    placeholder="Expiration Date (MM/YY)"
                    maxLength="5"
                    className="payment-input"
                    required
                  />
                  <input
                    type="text"
                    name="cvv"
                    placeholder="CVV"
                    maxLength="3"
                    className="payment-input"
                    required
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

          {/* Error Alert */}
          {paymentError && (
            <Alert severity="error" sx={{ marginBottom: '1.5rem' }}>
              {paymentError}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={submitting}
            size="large"
            sx={{
              height: '3rem',
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm Booking'}
          </Button>
        </form>
      </Box>

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
              Thank you, <strong>{bookingDetails?.fullName || formData.fullName}</strong>, for booking with us!
            </Typography>
            <Typography variant="body2" gutterBottom>
              Your booking ID is <strong>{bookingDetails?.bookingId}</strong>.
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Hotel:</strong> {bookingDetails?.hotelName}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Room Type:</strong> {bookingDetails?.roomType}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Check-In:</strong> {new Date(bookingDetails?.checkIn).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Check-Out:</strong> {new Date(bookingDetails?.checkOut).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Guests:</strong> {bookingDetails?.guests}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Amount Paid:</strong> USD ${bookingDetails?.amount}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Payment Method:</strong> {bookingDetails?.paymentMethod}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Receipt:</strong>{' '}
              <a href={bookingDetails?.receiptUrl} target="_blank" rel="noopener noreferrer">
                View Receipt
              </a>
            </Typography>
            <Typography variant="body2" gutterBottom>
              A confirmation email has been sent to <strong>{formData.email}</strong>.
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
  <div className="booking-loading-spinner">
    <CircularProgress />
    <p>Loading booking form...</p>
  </div>
);

const ErrorMessage = ({ error }) => (
  <div className="booking-error-message">
    <Alert severity="error">{error}</Alert>
  </div>
);

const NoHotelMessage = () => (
  <p className="booking-no-hotel-message">Hotel not found.</p>
);

const FormGroup = ({ id, label, value, onChange, type = 'text', required = false, children }) => (
  <div className="form-group">
    {type === 'select' ? (
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
      >
        {children}
      </select>
    ) : (
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
      />
    )}
    <label htmlFor={id}>
      {label}
      {required && <span className="required">*</span>}
    </label>
  </div>
);

export default HotelBook;
