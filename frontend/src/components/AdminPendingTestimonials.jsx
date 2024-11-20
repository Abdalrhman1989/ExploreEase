import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/AdminPendingTestimonials.css'; 

const AdminPendingTestimonials = () => {
  const { idToken, loading, isAuthenticated, userRole } = useContext(AuthContext);
  const [pendingTestimonials, setPendingTestimonials] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingTestimonials = async () => {
      if (!idToken) {
        setError('Authentication token missing. Please log in.');
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/testimonials/pending`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setPendingTestimonials(response.data.testimonials);
      } catch (err) {
        console.error('Error fetching pending testimonials:', err);
        if (err.response) {
          setError(err.response.data.message || 'Failed to fetch pending testimonials.');
        } else {
          setError('An error occurred. Please try again later.');
        }
      }
    };

    if (!loading && isAuthenticated && userRole === 'Admin') {
      fetchPendingTestimonials();
    }
  }, [idToken, loading, isAuthenticated, userRole]);

  const handleApprove = async (id) => {
    const confirmApprove = window.confirm('Are you sure you want to approve this testimonial?');
    if (!confirmApprove) return;

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/testimonials/approve/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      alert(response.data.message);
      setPendingTestimonials(pendingTestimonials.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error approving testimonial:', err);
      alert(err.response?.data?.message || 'Failed to approve testimonial.');
    }
  };

  const handleReject = async (id) => {
    const confirmReject = window.confirm('Are you sure you want to reject this testimonial?');
    if (!confirmReject) return;

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/testimonials/reject/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      alert(response.data.message);
      setPendingTestimonials(pendingTestimonials.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error rejecting testimonial:', err);
      alert(err.response?.data?.message || 'Failed to reject testimonial.');
    }
  };

  if (loading) {
    return (
      <div className="admin-pending-testimonials">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-pending-testimonials">
        <p>Please log in to view this page.</p>
      </div>
    );
  }

  if (userRole !== 'Admin') {
    return (
      <div className="admin-pending-testimonials">
        <p>Access denied. You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-pending-testimonials">
      <h2>Pending Testimonials</h2>
      {error && <div className="error-message">{error}</div>}
      {pendingTestimonials.length === 0 && !error ? (
        <p>No pending testimonials.</p>
      ) : (
        <ul>
          {pendingTestimonials.map(testimonial => (
            <li key={testimonial.id} className="testimonial-item">
              {/* User Image or Initials */}
              <div className="user-info-container">
                {testimonial.user.ProfilePicture ? (
                  <img
                    src={testimonial.user.ProfilePicture}
                    alt={`${testimonial.user.FirstName} ${testimonial.user.LastName}`}
                    className="user-profile-picture"
                  />
                ) : (
                  <div className="user-initials">
                    {testimonial.user.FirstName.charAt(0).toUpperCase()}
                    {testimonial.user.LastName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Testimonial Content */}
              <div className="testimonial-content-container">
                <p className="testimonial-content">"{testimonial.content}"</p>
                <p className="user-info">
                  <strong>{testimonial.user.FirstName} {testimonial.user.LastName}</strong> ({testimonial.user.Email})
                </p>
                <div className="testimonial-actions">
                  <button className="approve-btn" onClick={() => handleApprove(testimonial.id)}>
                    Approve
                  </button>
                  <button className="reject-btn" onClick={() => handleReject(testimonial.id)}>
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPendingTestimonials;