// src/components/Testimonials.jsx

import React, { useContext, useEffect, useState } from 'react';
import Slider from 'react-slick';
import '../styles/Home.css'; // Ensure this path is correct
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Testimonials = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [testimonialsData, setTestimonialsData] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({
    quote: '',
  });
  const [submissionStatus, setSubmissionStatus] = useState('');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/testimonials');
      setTestimonialsData(response.data.testimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewTestimonial({
      ...newTestimonial,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newTestimonial.quote.trim() === '') {
      setSubmissionStatus('Please enter a comment.');
      return;
    }

    setSubmissionStatus('Submitting...');

    try {
      const idToken = await user.getIdToken();
      const response = await axios.post(
        'http://localhost:3001/api/testimonials',
        {
          quote: newTestimonial.quote,
          userId: user.uid, // Assuming you want to associate the testimonial with the user
        },
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        }
      );

      if (response.data.success) {
        setSubmissionStatus('Thank you for your feedback!');
        setNewTestimonial({ quote: '' });
        fetchTestimonials(); // Refresh testimonials
      } else {
        setSubmissionStatus(response.data.message || 'Failed to submit testimonial.');
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      setSubmissionStatus('An error occurred. Please try again later.');
    }
  };

  // Testimonials Slider Settings
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

  return (
    <section className="testimonials">
      <h2>What Our Customers Say</h2>
      <Slider {...testimonialSettings} className="testimonials-slider">
        {testimonialsData.map((testimonial, index) => (
          <div className="testimonial-card" key={index}>
            <img
              src={testimonial.image || '/default-avatar.png'} // Provide a default avatar if not available
              alt={testimonial.name || 'Anonymous'}
              className="testimonial-image"
              loading="lazy"
            />
            <div className="testimonial-content">
              <p>"{testimonial.quote}"</p>
              <h4>{testimonial.name || 'Anonymous'}</h4>
            </div>
          </div>
        ))}
      </Slider>

      {/* Comment Form for Authenticated Users */}
      {isAuthenticated && (
        <div className="testimonial-form-container">
          <h3>Share Your Experience</h3>
          <form className="testimonial-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <textarea
                name="quote"
                value={newTestimonial.quote}
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
          {submissionStatus && <p className={`form-status ${submissionStatus.includes('error') ? 'error' : ''}`}>{submissionStatus}</p>}
        </div>
      )}
    </section>
  );
};

export default Testimonials;
