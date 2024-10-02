// src/components/admin/AdminBookings.jsx

import React, { useState, useEffect } from 'react';
import '../styles/AdminBookings.css';

const AdminBookings = () => {
  // Sample data
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Fetch bookings from an API or use sample data
    const sampleBookings = [
      { id: 1, user: 'John Doe', provider: 'Provider One', date: '2023-10-01' },
      { id: 2, user: 'Jane Smith', provider: 'Provider Two', date: '2023-10-05' },
      { id: 3, user: 'Bob Johnson', provider: 'Provider Three', date: '2023-10-10' },
    ];
    setBookings(sampleBookings);
  }, []);

  return (
    <div className="page-content">
      <h2>Admin Bookings Management</h2>
      <div className="bookings-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Provider</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.user}</td>
                <td>{booking.provider}</td>
                <td>{booking.date}</td>
                <td>
                  <button className="btn-view">View</button>
                  <button className="btn-cancel">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookings;
