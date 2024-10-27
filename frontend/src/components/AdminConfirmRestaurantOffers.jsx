// src/components/AdminConfirmRestaurantOffers.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminConfirmBusinessOffers.css'; // Reuse the same styles
import { toast } from 'react-toastify';

const AdminConfirmRestaurantOffers = () => {
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
      const token = localStorage.getItem('authToken'); // Ensure this key matches your auth implementation
      if (!token) {
        setActionError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.get(`${backendUrl}/api/restaurants/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOffers(response.data.restaurants);
    } catch (error) {
      console.error('Error fetching pending restaurant offers:', error.response ? error.response.data : error.message);
      setActionError('Failed to fetch pending restaurant offers.');
      toast.error('Failed to fetch pending restaurant offers.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionMessage(null);
    setActionError(null);
    try {
      const token = localStorage.getItem('authToken'); // Ensure this key matches your auth implementation
      if (!token) {
        setActionError('Authentication required. Please log in.');
        return;
      }
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.post(`${backendUrl}/api/restaurants/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setActionMessage(response.data.message);
      setOffers(offers.filter((offer) => offer.RestaurantID !== id));
      toast.success(response.data.message);
    } catch (error) {
      console.error(`Error approving restaurant offer ${id}:`, error.response ? error.response.data : error.message);
      setActionError(`Failed to approve restaurant offer ${id}.`);
      toast.error(`Failed to approve restaurant offer ${id}.`);
    }
  };

  const handleReject = async (id) => {
    setActionMessage(null);
    setActionError(null);
    try {
      const token = localStorage.getItem('authToken'); // Ensure this key matches your auth implementation
      if (!token) {
        setActionError('Authentication required. Please log in.');
        return;
      }
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.post(`${backendUrl}/api/restaurants/${id}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setActionMessage(response.data.message);
      setOffers(offers.filter((offer) => offer.RestaurantID !== id));
      toast.success(response.data.message);
    } catch (error) {
      console.error(`Error rejecting restaurant offer ${id}:`, error.response ? error.response.data : error.message);
      setActionError(`Failed to reject restaurant offer ${id}.`);
      toast.error(`Failed to reject restaurant offer ${id}.`);
    }
  };

  return (
    <div className="page-content">
      <h2>Confirm Business Restaurant Submissions</h2>
      <p>Review and approve or reject restaurant submissions from business users.</p>
      {actionMessage && <p className="success-message">{actionMessage}</p>}
      {actionError && <p className="error-message">{actionError}</p>}
      {loading ? (
        <p>Loading restaurant offers...</p>
      ) : offers.length === 0 ? (
        <p>No pending restaurant submissions to display.</p>
      ) : (
        <table className="offers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Restaurant Name</th>
              <th>Location</th>
              <th>Cuisine</th>
              <th>Price Range</th>
              <th>Rating</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((restaurant) => (
              <tr key={restaurant.RestaurantID}>
                <td>{restaurant.RestaurantID}</td>
                <td>{restaurant.name}</td>
                <td>{restaurant.location}</td>
                <td>{restaurant.cuisine}</td>
                <td>{'$'.repeat(restaurant.priceRange)}</td>
                <td>{restaurant.rating} ⭐</td>
                <td>{restaurant.description}</td>
                <td>
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(restaurant.RestaurantID)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(restaurant.RestaurantID)}
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

export default AdminConfirmRestaurantOffers;
