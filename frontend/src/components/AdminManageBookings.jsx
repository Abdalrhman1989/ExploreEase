// src/components/AdminManageBookings.jsx

import React, { useState, useEffect } from 'react';
import '../styles/AdminManageBookings.css';

const AdminManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const data = [
      { id: 1, user: 'John Doe', date: '2023-10-15', status: 'Confirmed' },
      { id: 2, user: 'Jane Smith', date: '2023-10-20', status: 'Confirmed' },
    ];
    setTimeout(() => {
      setBookings(data);
      setLoading(false);
    }, 1000);
  };

  const handleEdit = (id) => {
    console.log(`Editing booking ${id}`);
  };

  const handleCancel = (id) => {
    console.log(`Cancelling booking ${id}`);
    setBookings(bookings.filter((booking) => booking.id !== id));
  };

  return (
    <div className="page-content">
      <h2>Manage Bookings</h2>
      <p>Edit or cancel existing bookings.</p>
      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings to display.</p>
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
    </div>
  );
};

export default AdminManageBookings;
