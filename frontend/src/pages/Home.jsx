// src/pages/Home.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

import { FaHotel, FaPlane, FaCar, FaTrain, FaBus, FaUtensils } from 'react-icons/fa';
import axios from 'axios';

// Importing Images
import hotelImage from '../assets/hotel.jpg';
import flightImage from '../assets/flight.jpg';
import carRentalImage from '../assets/carrenter.jpg';
import trainImage from '../assets/train1.jpg';
import busImage from '../assets/bus1.jpg';
import restaurantImage from '../assets/Restaurant1.jpg';

// Importing Trending Destination Images
import paris1 from '../assets/paris1.jpg';
import newyork1 from '../assets/newyork1.jpg';
import tokyo1 from '../assets/tokyo1.jpg';
import london1 from '../assets/london1.jpg';

// Import the Testimonials component
import Testimonials from '../components/Testimonials';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Contact Form State
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [contactFormStatus, setContactFormStatus] = useState('');

  // Newsletter Form State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  const slides = [
    {
      title: 'Explore Stays',
      subtitle: 'Find the best hotels and more',
      imageUrl: hotelImage,
      link: '/stays',
      buttonText: 'Book Hotel Now',
      icon: <FaHotel />,
    },
    {
      title: 'Book Flights',
      subtitle: 'Discover great deals on flights',
      imageUrl: flightImage,
      link: '/flights',
      buttonText: 'Book Flight Now',
      icon: <FaPlane />,
    },
    {
      title: 'Rent a Car',
      subtitle: 'Convenient car rentals at your destination',
      imageUrl: carRentalImage,
      link: '/car-rentals',
      buttonText: 'Rent Car Now',
      icon: <FaCar />,
    },
    {
      title: 'Travel by Train',
      subtitle: 'Comfortable and scenic train journeys',
      imageUrl: trainImage,
      link: '/trains',
      buttonText: 'Book Train Now',
      icon: <FaTrain />,
    },
    {
      title: 'Bus Services',
      subtitle: 'Affordable and reliable bus services',
      imageUrl: busImage,
      link: '/buses',
      buttonText: 'Book Bus Now',
      icon: <FaBus />,
    },
    {
      title: 'Find Restaurants',
      subtitle: 'Delicious dining options near you',
      imageUrl: restaurantImage,
      link: '/restaurants',
      buttonText: 'Book Restaurant Now',
      icon: <FaUtensils />,
    },
  ];

  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(sliderInterval);
  }, [slides.length]);

  // Handle contact form input changes
  const handleContactChange = (e) => {
    setContactFormData({
      ...contactFormData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactFormStatus('Sending...');
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, contactFormData);
      if (response.data.success) {
        setContactFormStatus('Message sent successfully!');
        setContactFormData({ name: '', email: '', message: '' });
      } else {
        setContactFormStatus('Failed to send message. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setContactFormStatus('An error occurred. Please try again later.');
    }
  };

  // Handle newsletter form submission
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterStatus('Subscribing...');
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/subscribe`, {
        email: newsletterEmail,
      });
      if (response.data.success) {
        setNewsletterStatus('Subscribed successfully!');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus(response.data.message || 'Failed to subscribe. Please try again later.');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      if (error.response && error.response.data.message) {
        setNewsletterStatus(error.response.data.message);
      } else {
        setNewsletterStatus('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="home">
      {/* Hero Slider Section */}
      <div className="hero-slider" role="region" aria-label="Hero Slider">
        {/* Render only the active slide */}
        <div
          className="slide active"
          style={{ backgroundImage: `url(${slides[currentSlide].imageUrl})` }}
          aria-hidden="false"
        >
          <div className="slide-overlay"></div>
          <div className="slide-content">
            <h1 data-testid="hero-slide-title">{slides[currentSlide].title}</h1>
            <p>{slides[currentSlide].subtitle}</p>
            {/* Styled Link as Button */}
            <Link
              to={slides[currentSlide].link}
              className="cta-button"
              aria-label={slides[currentSlide].buttonText}
              data-testid="hero-cta-button"
            >
              {slides[currentSlide].buttonText}
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Services Section */}
      <section className="featured-services">
        <h2>Our Top Services</h2>
        <div className="service-cards">
          {slides.map((service, index) => (
            <div className="service-card" key={index}>
              <div className="service-icon">{service.icon}</div>
              <div className="service-content">
                <h3 data-testid={`service-title-${index}`}>{service.title}</h3>
                <p>{service.subtitle}</p>
                {/* Styled Link as Button */}
                <Link
                  to={service.link}
                  className="service-button"
                  aria-label={service.buttonText}
                  data-testid={`service-cta-button-${index}`}
                >
                  {service.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <h2>Why Choose Us?</h2>
        <div className="why-cards">
          <div className="why-card">
            <h3>Best Prices</h3>
            <p>We offer competitive pricing on all our services.</p>
          </div>
          <div className="why-card">
            <h3>24/7 Support</h3>
            <p>Our team is available around the clock to assist you.</p>
          </div>
          <div className="why-card">
            <h3>Global Reach</h3>
            <p>We cover destinations all over the world.</p>
          </div>
          <div className="why-card">
            <h3>Trusted Partners</h3>
            <p>We work with reliable service providers to ensure quality.</p>
          </div>
        </div>
      </section>

      {/* Trending Destinations Section */}
      <section className="trending-destinations">
        <h2>Trending Destinations</h2>
        <div className="destination-cards">
          {[
            { name: 'Paris', imageUrl: paris1 },
            { name: 'New York', imageUrl: newyork1 },
            { name: 'Tokyo', imageUrl: tokyo1 },
            { name: 'London', imageUrl: london1 },
            // Add more destinations as needed
          ].map((dest, index) => (
            <div className="destination-card" key={index}>
              <img src={dest.imageUrl} alt={`View of ${dest.name}`} loading="lazy" />
              <div className="destination-info">
                <h3>{dest.name}</h3>
                {/* Styled Link as Button */}
                <Link
                  to={`/destination/${dest.name.toLowerCase()}`}
                  className="explore-button"
                  aria-label={`Explore ${dest.name}`}
                  data-testid={`explore-button-${index}`}
                >
                  Explore {dest.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Contact Us Section */}
      <section className="contact-us">
        <h2>Contact Us</h2>
        <form className="contact-form" onSubmit={handleContactSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="name"
              name="name"
              value={contactFormData.name}
              onChange={handleContactChange}
              required
              placeholder=" "
            />
            <label htmlFor="name">Your Name</label>
          </div>
          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              value={contactFormData.email}
              onChange={handleContactChange}
              required
              placeholder=" "
            />
            <label htmlFor="email">Your Email</label>
          </div>
          <div className="form-group">
            <textarea
              id="message"
              name="message"
              value={contactFormData.message}
              onChange={handleContactChange}
              required
              placeholder=" "
            ></textarea>
            <label htmlFor="message">Your Message</label>
          </div>
          <button type="submit" className="cta-button">
            Send Message
          </button>
        </form>
        {contactFormStatus && (
          <p className={`form-status ${contactFormStatus.toLowerCase().includes('error') ? 'error' : ''}`}>
            {contactFormStatus}
          </p>
        )}
      </section>

      {/* Newsletter Subscription Section */}
      <section className="newsletter">
        <h2>Stay Updated!</h2>
        <p>Subscribe to our newsletter to get the latest deals and news.</p>
        <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
          <input
            type="email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="Enter your email"
            required
            aria-label="Email Address"
          />
          <button type="submit" className="cta-button">
            Subscribe
          </button>
        </form>
        {newsletterStatus && (
          <p className={`form-status ${newsletterStatus.toLowerCase().includes('error') ? 'error' : ''}`}>
            {newsletterStatus}
          </p>
        )}
      </section>
    </div>
  );
};

export default Home;
