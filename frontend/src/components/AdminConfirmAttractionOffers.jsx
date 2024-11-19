import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import '../styles/AdminConfirmAttractionOffers.css'; 
import { AuthContext } from '../context/AuthContext';

const AdminConfirmAttractionOffers = () => {
  const { isAuthenticated, userRole, idToken, loading } = useContext(AuthContext);
  const [attractions, setAttractions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && isAuthenticated && userRole === 'Admin') {
      fetchAttractions();
    }
  }, [loading, isAuthenticated, userRole]);

  const fetchAttractions = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.get(`${backendUrl}/api/attractions/pending`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setAttractions(response.data.attractions);
    } catch (err) {
      console.error('Error fetching attractions:', err);
      setError('Failed to fetch pending attractions.');
    }
  };

  const handleApproval = async (id, approve = true) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.post(`${backendUrl}/api/attractions/${id}/${approve ? 'approve' : 'reject'}`, {}, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      console.log(response.data.message);
      fetchAttractions();
    } catch (err) {
      console.error('Error updating attraction status:', err);
      setError('Failed to update attraction status.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && userRole !== 'Admin') {
    return <div>You do not have permission to view this page.</div>;
  }

  return (
    <div className="admin-confirm-attraction-offers">
      <h2>Pending Attraction Submissions</h2>
      {error && <p className="error-message">{error}</p>}
      {attractions.length === 0 ? (
        <p>No pending attractions.</p>
      ) : (
        <table className="attractions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>City</th>
              <th>Type</th>
              <th>Entry Fee</th>
              <th>Opening Hours</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attractions.map((attraction) => (
              <tr key={attraction.AttractionID}>
                <td>{attraction.AttractionID}</td>
                <td>{attraction.name}</td>
                <td>{attraction.location}</td>
                <td>{attraction.city}</td>
                <td>{attraction.type}</td>
                <td>${attraction.entryFee.toFixed(2)}</td>
                <td>{attraction.openingHours}</td>
                <td>
                  <button onClick={() => handleApproval(attraction.AttractionID, true)} className="approve-button">
                    Approve
                  </button>
                  <button onClick={() => handleApproval(attraction.AttractionID, false)} className="reject-button">
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

export default AdminConfirmAttractionOffers;
