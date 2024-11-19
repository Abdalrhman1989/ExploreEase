import React, { useState, useEffect, useContext } from 'react';
import '../styles/AdminBookings.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext'; 

const AdminBookings = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  // State Variables for Hotel Bookings
  const [hotelBookings, setHotelBookings] = useState([]); 
  const [pendingHotelBookings, setPendingHotelBookings] = useState([]); 
  const [rejectedHotelBookings, setRejectedHotelBookings] = useState([]); 

  // State Variables for Flight Bookings
  const [flightBookings, setFlightBookings] = useState([]); 
  const [pendingFlightBookings, setPendingFlightBookings] = useState([]); 
  const [rejectedFlightBookings, setRejectedFlightBookings] = useState([]); 

  const [loading, setLoading] = useState(true);

  // Confirmation Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [bookingType, setBookingType] = useState(''); 

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const token = localStorage.getItem('authToken'); 

      // Fetch Hotel Bookings
      const hotelResponse = await axios.get(`${backendUrl}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (hotelResponse.status === 200) {
        const allHotelBookings = hotelResponse.data.bookings;
        setHotelBookings(allHotelBookings.filter(booking => booking.status === 'Approved'));
        setPendingHotelBookings(allHotelBookings.filter(booking => booking.status === 'Pending'));
        setRejectedHotelBookings(allHotelBookings.filter(booking => booking.status === 'Rejected'));
      }

      // Fetch Flight Bookings
      const flightResponse = await axios.get(`${backendUrl}/api/flight-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (flightResponse.status === 200) {
        const allFlightBookings = flightResponse.data.flightBookings;
        setFlightBookings(allFlightBookings.filter(booking => booking.status === 'Approved'));
        setPendingFlightBookings(allFlightBookings.filter(booking => booking.status === 'Pending'));
        setRejectedFlightBookings(allFlightBookings.filter(booking => booking.status === 'Rejected'));
      }

    } catch (err) {
      console.error('Error fetching bookings:', err.response ? err.response.data : err.message);
      toast.error('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  // Handler to Open Confirmation Dialog
  const handleStatusChange = (booking, type, status) => {
    setCurrentBooking(booking);
    setBookingType(type);
    setNewStatus(status); 
    setOpenDialog(true);
  };

  // Handler to Close Confirmation Dialog
  const handleDialogClose = () => {
    setOpenDialog(false);
    setCurrentBooking(null);
    setNewStatus('');
    setBookingType('');
  };

  // Handler to Update Booking Status
  const handleStatusUpdate = async () => {
    if (!currentBooking || !bookingType) return;

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const token = localStorage.getItem('authToken');

      let endpoint = '';
      let payload = {};

      if (bookingType === 'hotel') {
        endpoint = `/api/bookings/${currentBooking.BookingID}`;
        payload = {
          status: newStatus,
        };
      } else if (bookingType === 'flight') {
        endpoint = `/api/flight-bookings/${currentBooking.FlightBookingID}`;
        payload = {
          status: newStatus,
        };
      }

      const response = await axios.put(
        `${backendUrl}${endpoint}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(`Booking ID ${bookingType === 'hotel' ? currentBooking.BookingID : currentBooking.FlightBookingID} status updated to ${newStatus}.`);

        // Update State Based on Booking Type
        if (bookingType === 'hotel') {
          // Remove from all categories
          setHotelBookings(hotelBookings.filter(b => b.BookingID !== currentBooking.BookingID));
          setPendingHotelBookings(pendingHotelBookings.filter(b => b.BookingID !== currentBooking.BookingID));
          setRejectedHotelBookings(rejectedHotelBookings.filter(b => b.BookingID !== currentBooking.BookingID));

          // Add to the appropriate category based on updated status
          if (newStatus === 'Approved') {
            setHotelBookings([...hotelBookings, response.data.booking]);
          } else if (newStatus === 'Pending') {
            setPendingHotelBookings([...pendingHotelBookings, response.data.booking]);
          } else if (newStatus === 'Rejected') {
            setRejectedHotelBookings([...rejectedHotelBookings, response.data.booking]);
          }
        } else if (bookingType === 'flight') {
          // Remove from all categories
          setFlightBookings(flightBookings.filter(b => b.FlightBookingID !== currentBooking.FlightBookingID));
          setPendingFlightBookings(pendingFlightBookings.filter(b => b.FlightBookingID !== currentBooking.FlightBookingID));
          setRejectedFlightBookings(rejectedFlightBookings.filter(b => b.FlightBookingID !== currentBooking.FlightBookingID));

          // Add to the appropriate category based on updated status
          if (newStatus === 'Approved') {
            setFlightBookings([...flightBookings, response.data.flightBooking]);
          } else if (newStatus === 'Pending') {
            setPendingFlightBookings([...pendingFlightBookings, response.data.flightBooking]);
          } else if (newStatus === 'Rejected') {
            setRejectedFlightBookings([...rejectedFlightBookings, response.data.flightBooking]);
          }
        }

        handleDialogClose();
      }
    } catch (err) {
      console.error('Error updating booking status:', err.response ? err.response.data : err.message);
      toast.error('Failed to update booking status.');
    }
  };

  // Handler to Cancel a Booking (For Approved Bookings)
  const handleCancelBooking = async (booking, type) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const token = localStorage.getItem('authToken');

      let endpoint = '';
      if (type === 'hotel') {
        endpoint = `/api/bookings/${booking.BookingID}`;
      } else if (type === 'flight') {
        endpoint = `/api/flight-bookings/${booking.FlightBookingID}`;
      }

      const response = await axios.put(
        `${backendUrl}${endpoint}`,
        { status: 'Cancelled' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(`Booking ID ${type === 'hotel' ? booking.BookingID : booking.FlightBookingID} cancelled.`);

        // Update State Based on Booking Type
        if (type === 'hotel') {
          setHotelBookings(hotelBookings.filter(b => b.BookingID !== booking.BookingID));
        } else if (type === 'flight') {
          setFlightBookings(flightBookings.filter(b => b.FlightBookingID !== booking.FlightBookingID));
        }
      }
    } catch (err) {
      console.error('Error cancelling booking:', err.response ? err.response.data : err.message);
      toast.error('Failed to cancel booking.');
    }
  };

  if (loading)
    return (
      <Container
        maxWidth="md"
        sx={{
          marginTop: '3rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ marginTop: '1rem' }}>
          Loading bookings...
        </Typography>
      </Container>
    );

  return (
    <Container maxWidth="lg" sx={{ marginTop: '3rem', marginBottom: '3rem' }}>
      {/* Toast Container for Notifications */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />

      <Typography variant="h4" gutterBottom>
        Bookings Management
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Manage and confirm user bookings for both Hotels and Flights.
      </Typography>

      {/* Pending Hotel Bookings */}
      <Box sx={{ marginTop: '2rem' }}>
        <Typography variant="h5" gutterBottom>
          Pending Hotel Bookings
        </Typography>
        {pendingHotelBookings.length === 0 ? (
          <Alert severity="info">No pending hotel bookings to display.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table aria-label="pending hotel bookings table">
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Hotel</TableCell>
                  <TableCell>Room Type</TableCell>
                  <TableCell>Check-In</TableCell>
                  <TableCell>Check-Out</TableCell>
                  <TableCell>Guests</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingHotelBookings.map((booking) => (
                  <TableRow key={booking.BookingID}>
                    <TableCell>{booking.BookingID}</TableCell>
                    <TableCell>{`${booking.user.firstName} ${booking.user.lastName}`}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{booking.hotel.name}</TableCell>
                    <TableCell>{booking.roomType}</TableCell>
                    <TableCell>{new Date(booking.checkIn).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(booking.checkOut).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.guests}</TableCell>
                    <TableCell>
                      <Alert severity="warning" sx={{ padding: '0.5rem' }}>
                        {booking.status}
                      </Alert>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                        onClick={() => handleStatusChange(booking, 'hotel', 'Approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                        onClick={() => handleStatusChange(booking, 'hotel', 'Rejected')}
                      >
                        Reject
                      </Button>
                      {/* Optional: Edit Button */}
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleStatusChange(booking, 'hotel', 'Edit')}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Pending Flight Bookings */}
      <Box sx={{ marginTop: '4rem' }}>
        <Typography variant="h5" gutterBottom>
          Pending Flight Bookings
        </Typography>
        {pendingFlightBookings.length === 0 ? (
          <Alert severity="info">No pending flight bookings to display.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table aria-label="pending flight bookings table">
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Flight Number</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Departure</TableCell>
                  <TableCell>Arrival</TableCell>
                  <TableCell>Seat Class</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingFlightBookings.map((booking) => (
                  <TableRow key={booking.FlightBookingID}>
                    <TableCell>{booking.FlightBookingID}</TableCell>
                    <TableCell>{`${booking.firstName} ${booking.lastName}`}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{booking.flightNumber}</TableCell>
                    <TableCell>{`${booking.departureAirport} → ${booking.arrivalAirport}`}</TableCell>
                    <TableCell>{new Date(booking.departureTime).toLocaleString()}</TableCell>
                    <TableCell>{new Date(booking.arrivalTime).toLocaleString()}</TableCell>
                    <TableCell>{booking.seatClass}</TableCell>
                    <TableCell>{`${booking.price.currency} ${booking.price}`}</TableCell>
                    <TableCell>
                      <Alert severity="warning" sx={{ padding: '0.5rem' }}>
                        {booking.status}
                      </Alert>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                        onClick={() => handleStatusChange(booking, 'flight', 'Approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                        onClick={() => handleStatusChange(booking, 'flight', 'Rejected')}
                      >
                        Reject
                      </Button>
                      {/* Optional: Edit Button */}
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleStatusChange(booking, 'flight', 'Edit')}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Approved Hotel Bookings */}
      <Box sx={{ marginTop: '4rem' }}>
        <Typography variant="h5" gutterBottom>
          Approved Hotel Bookings
        </Typography>
        {hotelBookings.length === 0 ? (
          <Alert severity="info">No approved hotel bookings to display.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table aria-label="approved hotel bookings table">
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Hotel</TableCell>
                  <TableCell>Room Type</TableCell>
                  <TableCell>Check-In</TableCell>
                  <TableCell>Check-Out</TableCell>
                  <TableCell>Guests</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hotelBookings.map((booking) => (
                  <TableRow key={booking.BookingID}>
                    <TableCell>{booking.BookingID}</TableCell>
                    <TableCell>{`${booking.user.firstName} ${booking.user.lastName}`}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{booking.hotel.name}</TableCell>
                    <TableCell>{booking.roomType}</TableCell>
                    <TableCell>{new Date(booking.checkIn).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(booking.checkOut).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.guests}</TableCell>
                    <TableCell>
                      <Alert severity="success" sx={{ padding: '0.5rem' }}>
                        {booking.status}
                      </Alert>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{ marginRight: '0.5rem' }}
                        onClick={() => handleCancelBooking(booking, 'hotel')}
                      >
                        Cancel
                      </Button>
                      {/* Optional: Edit Button */}
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleStatusChange(booking, 'hotel', 'Edit')}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Approved Flight Bookings */}
      <Box sx={{ marginTop: '4rem' }}>
        <Typography variant="h5" gutterBottom>
          Approved Flight Bookings
        </Typography>
        {flightBookings.length === 0 ? (
          <Alert severity="info">No approved flight bookings to display.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table aria-label="approved flight bookings table">
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Flight Number</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Departure</TableCell>
                  <TableCell>Arrival</TableCell>
                  <TableCell>Seat Class</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flightBookings.map((booking) => (
                  <TableRow key={booking.FlightBookingID}>
                    <TableCell>{booking.FlightBookingID}</TableCell>
                    <TableCell>{`${booking.firstName} ${booking.lastName}`}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{booking.flightNumber}</TableCell>
                    <TableCell>{`${booking.departureAirport} → ${booking.arrivalAirport}`}</TableCell>
                    <TableCell>{new Date(booking.departureTime).toLocaleString()}</TableCell>
                    <TableCell>{new Date(booking.arrivalTime).toLocaleString()}</TableCell>
                    <TableCell>{booking.seatClass}</TableCell>
                    <TableCell>{`${booking.price.currency} ${booking.price}`}</TableCell>
                    <TableCell>
                      <Alert severity="success" sx={{ padding: '0.5rem' }}>
                        {booking.status}
                      </Alert>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{ marginRight: '0.5rem' }}
                        onClick={() => handleCancelBooking(booking, 'flight')}
                      >
                        Cancel
                      </Button>
                      {/* Optional: Edit Button */}
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleStatusChange(booking, 'flight', 'Edit')}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Rejected Hotel Bookings */}
      <Box sx={{ marginTop: '4rem' }}>
        <Typography variant="h5" gutterBottom>
          Rejected Hotel Bookings
        </Typography>
        {rejectedHotelBookings.length === 0 ? (
          <Alert severity="info">No rejected hotel bookings to display.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table aria-label="rejected hotel bookings table">
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Hotel</TableCell>
                  <TableCell>Room Type</TableCell>
                  <TableCell>Check-In</TableCell>
                  <TableCell>Check-Out</TableCell>
                  <TableCell>Guests</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rejectedHotelBookings.map((booking) => (
                  <TableRow key={booking.BookingID}>
                    <TableCell>{booking.BookingID}</TableCell>
                    <TableCell>{`${booking.user.firstName} ${booking.user.lastName}`}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{booking.hotel.name}</TableCell>
                    <TableCell>{booking.roomType}</TableCell>
                    <TableCell>{new Date(booking.checkIn).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(booking.checkOut).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.guests}</TableCell>
                    <TableCell>
                      <Alert severity="error" sx={{ padding: '0.5rem' }}>
                        {booking.status}
                      </Alert>
                    </TableCell>
                    <TableCell>
                      {/* Optional: Edit Button */}
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleStatusChange(booking, 'hotel', 'Edit')}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Rejected Flight Bookings */}
      <Box sx={{ marginTop: '4rem' }}>
        <Typography variant="h5" gutterBottom>
          Rejected Flight Bookings
        </Typography>
        {rejectedFlightBookings.length === 0 ? (
          <Alert severity="info">No rejected flight bookings to display.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table aria-label="rejected flight bookings table">
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Flight Number</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Departure</TableCell>
                  <TableCell>Arrival</TableCell>
                  <TableCell>Seat Class</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rejectedFlightBookings.map((booking) => (
                  <TableRow key={booking.FlightBookingID}>
                    <TableCell>{booking.FlightBookingID}</TableCell>
                    <TableCell>{`${booking.firstName} ${booking.lastName}`}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{booking.flightNumber}</TableCell>
                    <TableCell>{`${booking.departureAirport} → ${booking.arrivalAirport}`}</TableCell>
                    <TableCell>{new Date(booking.departureTime).toLocaleString()}</TableCell>
                    <TableCell>{new Date(booking.arrivalTime).toLocaleString()}</TableCell>
                    <TableCell>{booking.seatClass}</TableCell>
                    <TableCell>{`${booking.price.currency} ${booking.price}`}</TableCell>
                    <TableCell>
                      <Alert severity="error" sx={{ padding: '0.5rem' }}>
                        {booking.status}
                      </Alert>
                    </TableCell>
                    <TableCell>
                      {/* Optional: Edit Button */}
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleStatusChange(booking, 'flight', 'Edit')}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Status Update Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="status-update-dialog-title"
      >
        <DialogTitle id="status-update-dialog-title">Update Booking Status</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to change the status of Booking ID{' '}
            <strong>{bookingType === 'hotel' ? currentBooking?.BookingID : currentBooking?.FlightBookingID}</strong> to{' '}
            <strong>{newStatus}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminBookings;
