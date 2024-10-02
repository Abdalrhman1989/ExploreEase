// src/components/AdminConfirmBookings.jsx

import React, { useState, useEffect } from 'react';
import '../styles/AdminConfirmBookings.css';

const AdminConfirmBookings = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from an API
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    // Replace with actual API call
    // For demo purposes, using static data
    const data = [
      { id: 1, user: 'John Doe', date: '2023-10-15', status: 'Pending' },
      { id: 2, user: 'Jane Smith', date: '2023-10-20', status: 'Pending' },
    ];
    setTimeout(() => {
      setPendingBookings(data);
      setLoading(false);
    }, 1000);
  };

  const handleApprove = (id) => {
    // Implement approve logic here
    console.log(`Booking ${id} approved`);
    setPendingBookings(pendingBookings.filter((booking) => booking.id !== id));
  };

  const handleReject = (id) => {
    // Implement reject logic here
    console.log(`Booking ${id} rejected`);
    setPendingBookings(pendingBookings.filter((booking) => booking.id !== id));
  };

  return (
    <div className="page-content">
      <h2>Confirm User Bookings</h2>
      <p>Review and approve or reject pending bookings.</p>
      {loading ? (
        <p>Loading pending bookings...</p>
      ) : pendingBookings.length === 0 ? (
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
    </div>
  );
};

export default AdminConfirmBookings;
