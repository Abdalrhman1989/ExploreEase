// src/components/AdminConfirmBusinessOffers.jsx

import React, { useState, useEffect } from 'react';
import '../styles/AdminConfirmBusinessOffers.css';

const AdminConfirmBusinessOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    const data = [
      { id: 1, business: 'Hotel ABC', offer: '20% off', status: 'Pending' },
      { id: 2, business: 'Car Rental XYZ', offer: 'Free GPS', status: 'Pending' },
    ];
    setTimeout(() => {
      setOffers(data);
      setLoading(false);
    }, 1000);
  };

  const handleApprove = (id) => {
    console.log(`Offer ${id} approved`);
    setOffers(offers.filter((offer) => offer.id !== id));
  };

  const handleReject = (id) => {
    console.log(`Offer ${id} rejected`);
    setOffers(offers.filter((offer) => offer.id !== id));
  };

  return (
    <div className="page-content">
      <h2>Confirm Business Offers</h2>
      <p>Review and approve or reject offers from businesses.</p>
      {loading ? (
        <p>Loading offers...</p>
      ) : offers.length === 0 ? (
        <p>No pending offers to display.</p>
      ) : (
        <table className="offers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Business</th>
              <th>Offer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td>{offer.id}</td>
                <td>{offer.business}</td>
                <td>{offer.offer}</td>
                <td>{offer.status}</td>
                <td>
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(offer.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(offer.id)}
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
