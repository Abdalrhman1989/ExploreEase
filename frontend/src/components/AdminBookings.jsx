// src/components/AdminBookings.jsx

import React, { useState, useEffect } from 'react';
import '../styles/AdminBookings.css';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    fetchPendingBookings();
  }, []);

  const fetchBookings = async () => {
    // Replace with actual API call
    const data = [
      { id: 1, user: 'John Doe', date: '2024-04-15', status: 'Confirmed' },
      { id: 2, user: 'Jane Smith', date: '2024-04-20', status: 'Confirmed' },
    ];
    // Simulate API call delay
    setTimeout(() => {
      setBookings(data);
      setLoading(false);
    }, 1000);
  };

  const fetchPendingBookings = async () => {
    // Replace with actual API call
    const data = [
      { id: 3, user: 'Alice Johnson', date: '2024-04-25', status: 'Pending' },
      { id: 4, user: 'Bob Brown', date: '2024-04-30', status: 'Pending' },
    ];
    // Simulate API call delay
    setTimeout(() => {
      setPendingBookings(data);
      setLoading(false);
    }, 1000);
  };

  // Manage Bookings Handlers
  const handleEdit = (id) => {
    console.log(`Editing booking ${id}`);
    // Implement edit functionality (e.g., open a modal with booking details)
  };

  const handleCancel = (id) => {
    console.log(`Cancelling booking ${id}`);
    // Implement cancel functionality (e.g., API call to cancel booking)
    setBookings(bookings.filter((booking) => booking.id !== id));
  };

  // Confirm Bookings Handlers
  const handleApprove = (id) => {
    console.log(`Booking ${id} approved`);
    // Implement approve functionality (e.g., API call to approve booking)
    setPendingBookings(pendingBookings.filter((booking) => booking.id !== id));
    // Optionally, move to confirmed bookings
    setBookings([
      ...bookings,
      {
        id,
        user: pendingBookings.find((b) => b.id === id).user,
        date: pendingBookings.find((b) => b.id === id).date,
        status: 'Confirmed',
      },
    ]);
  };

  const handleReject = (id) => {
    console.log(`Booking ${id} rejected`);
    // Implement reject functionality (e.g., API call to reject booking)
    setPendingBookings(pendingBookings.filter((booking) => booking.id !== id));
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
                    <th>ID</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.user}</td>
                      <td>{booking.date}</td>
                      <td>{booking.status}</td>
                      <td>
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(booking.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(booking.id)}
                        >
                          Reject
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
                    <th>ID</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.user}</td>
                      <td>{booking.date}</td>
                      <td>{booking.status}</td>
                      <td>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(booking.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel
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
