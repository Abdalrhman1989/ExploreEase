import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminConfirmBusinessOffers.css';

const AdminConfirmBusinessOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    setActionMessage(null);
    setActionError(null);
    try {
      const token = localStorage.getItem('authToken'); 
      if (!token) {
        setActionError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/hotels/pending`, { 
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOffers(response.data.hotels);
    } catch (error) {
      console.error('Error fetching pending offers:', error);
      setActionError('Failed to fetch pending offers.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionMessage(null);
    setActionError(null);
    try {
      const token = localStorage.getItem('authToken'); 
      if (!token) {
        setActionError('Authentication required. Please log in.');
        return;
      }
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/hotels/${id}/approve`, {}, { 
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setActionMessage(response.data.message);
      setOffers(offers.filter((offer) => offer.HotelID !== id));
    } catch (error) {
      console.error(`Error approving offer ${id}:`, error);
      setActionError(`Failed to approve offer ${id}.`);
    }
  };

  const handleReject = async (id) => {
    setActionMessage(null);
    setActionError(null);
    try {
      const token = localStorage.getItem('authToken'); 
      if (!token) {
        setActionError('Authentication required. Please log in.');
        return;
      }
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/hotels/${id}/reject`, {}, { // Updated URL
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setActionMessage(response.data.message);
      setOffers(offers.filter((offer) => offer.HotelID !== id));
    } catch (error) {
      console.error(`Error rejecting offer ${id}:`, error);
      setActionError(`Failed to reject offer ${id}.`);
    }
  };

  return (
    <div className="page-content">
      <h2>Confirm Business Hotel Submissions</h2>
      <p>Review and approve or reject hotel submissions from business users.</p>
      {actionMessage && <p className="success-message">{actionMessage}</p>}
      {actionError && <p className="error-message">{actionError}</p>}
      {loading ? (
        <p>Loading offers...</p>
      ) : offers.length === 0 ? (
        <p>No pending hotel submissions to display.</p>
      ) : (
        <table className="offers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hotel Name</th>
              <th>Location</th>
              <th>Base Price</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((hotel) => (
              <tr key={hotel.HotelID}>
                <td>{hotel.HotelID}</td>
                <td>{hotel.name}</td>
                <td>{hotel.location}</td>
                <td>${parseFloat(hotel.basePrice).toFixed(2)}</td>
                <td>{hotel.description}</td>
                <td>
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(hotel.HotelID)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(hotel.HotelID)}
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

export default AdminConfirmBusinessOffers;