import React, { useContext, useEffect, useState } from 'react';
import Slider from 'react-slick';
import '../styles/Testimonials.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Testimonials = () => {
  const { isAuthenticated, user, idToken } = useContext(AuthContext);
  const [testimonialsData, setTestimonialsData] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({ content: '' });
  const [submissionStatus, setSubmissionStatus] = useState('');

  // Fetch testimonials on component mount
  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Fetch testimonials from API
  const fetchTestimonials = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.get(`${backendUrl}/api/testimonials`);
      setTestimonialsData(response.data.testimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  // Handle input changes in the form
  const handleInputChange = (e) => {
    setNewTestimonial({
      ...newTestimonial,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = newTestimonial.content.trim();

    if (!content) {
      setSubmissionStatus({ message: 'Please enter your testimonial.', type: 'error' });
      return;
    }

    setSubmissionStatus({ message: 'Submitting...', type: 'info' });

    try {
      if (!idToken) {
        setSubmissionStatus({ message: 'Authentication token missing. Please log in.', type: 'error' });
        return;
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.post(
        `${backendUrl}/api/testimonials`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.data.success) {
        setSubmissionStatus({ message: 'Thank you for your testimonial!', type: 'success' });
        setNewTestimonial({ content: '' });
        fetchTestimonials();
      } else {
        setSubmissionStatus({ message: response.data.message || 'Failed to submit testimonial.', type: 'error' });
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      if (error.response && error.response.status === 401) {
        setSubmissionStatus({ message: 'Unauthorized. Please log in again.', type: 'error' });
      } else {
        setSubmissionStatus({ message: 'An error occurred. Please try again later.', type: 'error' });
      }
    }
  };

  // Slider settings
  const testimonialSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 9000,
    arrows: true,
    adaptiveHeight: true,
    pauseOnHover: true,
    accessibility: true,
    centerMode: true,
    centerPadding: '0px',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          centerMode: false,
        },
      },
    ],
  };

  // Get user's initial
  const getInitial = (firstName, lastName) => {
    if (firstName && firstName.length > 0) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName && lastName.length > 0) {
      return lastName.charAt(0).toUpperCase();
    }
    return 'A'; 
  };

  // Construct image URL
  const getImageUrl = (path) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    return `${backendUrl}${path}`;
  };

  return (
    <section className="testimonials">
      <h2>What Our Customers Say</h2>
      <Slider {...testimonialSettings} className="testimonials-slider">
        {testimonialsData.map((testimonial, index) => (
          <div className="testimonial-card" key={index}>
            {/* Conditionally render image or initial */}
            {testimonial.user.ProfilePicture ? (
              <img
                src={getImageUrl(testimonial.user.ProfilePicture)}
                alt={`${testimonial.user.UserName || 'Anonymous'}`}
                className="testimonial-image"
                loading="lazy"
                onError={(e) => {
                  console.error(`Error loading image for ${testimonial.user.UserName}`);
                  e.target.onerror = null; 
                  e.target.src = '/default-avatar.png'; 
                }}
              />
            ) : (
              <div className="testimonial-initial" aria-label="User Initial">
                {getInitial(testimonial.user.FirstName, testimonial.user.LastName)}
              </div>
            )}
            <div className="testimonial-content">
              <p>"{testimonial.content}"</p>
              <h4>
                {testimonial.user.FirstName} {testimonial.user.LastName}
              </h4>
              <small>{testimonial.user.Email}</small>
            </div>
          </div>
        ))}
      </Slider>

      {/* Testimonial Submission Form for Authenticated Users */}
      {isAuthenticated && (
        <div className="testimonial-form-container">
          <h3>Share Your Experience</h3>
          <form className="testimonial-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <textarea
                name="content"
                value={newTestimonial.content}
                onChange={handleInputChange}
                placeholder="Write your testimonial here..."
                required
                aria-label="Testimonial"
              ></textarea>
            </div>
            <button type="submit" className="cta-button">
              Submit Testimonial
            </button>
          </form>
          {submissionStatus && (
            <p
              className={`form-status ${submissionStatus.type}`}
              role="alert"
              aria-live="polite"
            >
              {submissionStatus.message}
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default Testimonials;
