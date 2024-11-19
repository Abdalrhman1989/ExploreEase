import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Reviews.css'; 

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const BASE_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/reviews`);
        setReviews(response.data.reviews);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews.');
        setLoading(false);
      }
    };

    fetchReviews();
  }, [BASE_URL]);

  // Handle input changes for new review
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission for new review
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token'); 

      const response = await axios.post(
        `${BASE_URL}/api/reviews`,
        { ...newReview },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMsg('Review submitted successfully!');
        setNewReview({ rating: 5, comment: '' });
        setReviews([response.data.review, ...reviews]);
      } else {
        setError(response.data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(
        err.response?.data?.message ||
          'An error occurred while submitting the review.'
      );
    }
  };

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="reviews-container">
      <h2>Customer Reviews</h2>

      {/* Display existing reviews */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div className="review-card" key={review.id}>
              <div className="review-header">
                <strong>
                  {review.user.FirstName} {review.user.LastName}
                </strong>
                <span>Rating: {review.rating}/5</span>
              </div>
              <p>{review.comment}</p>
              <small>
                {new Date(review.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))
        )}
      </div>

      {/* Submit a new review */}
      <div className="submit-review">
        <h3>Submit Your Review</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="rating">Rating:</label>
            <select
              id="rating"
              name="rating"
              value={newReview.rating}
              onChange={handleInputChange}
              required
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="comment">Comment:</label>
            <textarea
              id="comment"
              name="comment"
              value={newReview.comment}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          <button type="submit" className="submit-button">
            Submit Review
          </button>
        </form>
        {successMsg && <p className="success">{successMsg}</p>}
      </div>
    </div>
  );
};

export default Reviews;
