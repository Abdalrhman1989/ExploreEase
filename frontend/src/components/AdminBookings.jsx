// frontend/src/components/AdminBookings.jsx

import React, { useState, useEffect } from 'react';
import '../styles/AdminBookings.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token'); // Ensure admin is logged in

      const response = await axios.get(`${backendUrl}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const allBookings = response.data.bookings;
        setBookings(allBookings.filter(booking => booking.status === 'Approved'));
        setPendingBookings(allBookings.filter(booking => booking.status === 'Pending'));
      }
    } catch (err) {
      console.error('Error fetching bookings:', err.response ? err.response.data : err.message);
      toast.error('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for managing bookings
  const handleApprove = async (id) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${backendUrl}/api/bookings/${id}`,
        { status: 'Approved' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success(`Booking ${id} approved.`);
        // Update state
        const approvedBooking = pendingBookings.find(b => b.BookingID === id);
        setPendingBookings(pendingBookings.filter(b => b.BookingID !== id));
        setBookings([...bookings, { ...approvedBooking, status: 'Approved' }]);
      }
    } catch (err) {
      console.error('Error approving booking:', err.response ? err.response.data : err.message);
      toast.error('Failed to approve booking.');
    }
  };

  const handleReject = async (id) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${backendUrl}/api/bookings/${id}`,
        { status: 'Rejected' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success(`Booking ${id} rejected.`);
        // Update state
        setPendingBookings(pendingBookings.filter(b => b.BookingID !== id));
      }
    } catch (err) {
      console.error('Error rejecting booking:', err.response ? err.response.data : err.message);
      toast.error('Failed to reject booking.');
    }
  };

  const handleEdit = (id) => {
    // Implement edit functionality, such as opening a modal with booking details
    console.log(`Editing booking ${id}`);
    // You can redirect to an edit page or open a modal to handle editing
  };

  const handleCancel = async (id) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${backendUrl}/api/bookings/${id}`,
        { status: 'Cancelled' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success(`Booking ${id} cancelled.`);
        // Remove from confirmed bookings
        setBookings(bookings.filter(b => b.BookingID !== id));
      }
    } catch (err) {
      console.error('Error cancelling booking:', err.response ? err.response.data : err.message);
      toast.error('Failed to cancel booking.');
    }
  };

  return (
    <div className="page-content">
      <h2>Bookings Management</h2>
      <p>Manage and confirm user bookings.</p>
      {loading ? (
        <p>Loading bookings...</p>
      ) : (
        <>
          {/* Pending Bookings Section */}
          <section className="bookings-section">
            <h3>Pending Bookings</h3>
            {pendingBookings.length === 0 ? (
              <p>No pending bookings to display.</p>
            ) : (
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>BookingID</th>
                    <th>User</th>
                    <th>Hotel</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Guests</th>
                    <th>Room Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.map((booking) => (
                    <tr key={booking.BookingID}>
                      <td>{booking.BookingID}</td>
                      <td>{booking.user.UserName}</td>
                      <td>{booking.hotel.name}</td>
                      <td>{booking.checkIn}</td>
                      <td>{booking.checkOut}</td>
                      <td>{booking.guests}</td>
                      <td>{booking.roomType}</td>
                      <td>{booking.status}</td>
                      <td>
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(booking.BookingID)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(booking.BookingID)}
                        >
                          Reject
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(booking.BookingID)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Confirmed Bookings Section */}
          <section className="bookings-section">
            <h3>Confirmed Bookings</h3>
            {bookings.length === 0 ? (
              <p>No confirmed bookings to display.</p>
            ) : (
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>BookingID</th>
                    <th>User</th>
                    <th>Hotel</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Guests</th>
                    <th>Room Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.BookingID}>
                      <td>{booking.BookingID}</td>
                      <td>{booking.user.UserName}</td>
                      <td>{booking.hotel.name}</td>
                      <td>{booking.checkIn}</td>
                      <td>{booking.checkOut}</td>
                      <td>{booking.guests}</td>
                      <td>{booking.roomType}</td>
                      <td>{booking.status}</td>
                      <td>
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancel(booking.BookingID)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(booking.BookingID)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default AdminBookings;
