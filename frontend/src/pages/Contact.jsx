// src/pages/Contact.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Contact.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { FaHotel, FaPlane, FaCar, FaTrain, FaBus, FaUtensils, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaEnvelope, FaComments } from 'react-icons/fa';
import axios from 'axios';

// Importing Images (Ensure these paths are correct)
import hotelImage from '../assets/hotel.jpg';
import flightImage from '../assets/flight.jpg';
import carRentalImage from '../assets/carrenter.jpg';
import trainImage from '../assets/train1.jpg';
import busImage from '../assets/bus1.jpg';
import restaurantImage from '../assets/Restaurant1.jpg';

const Contact = () => {
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
    }, 5000); // Change slide every 5 seconds
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
      const response = await axios.post('http://localhost:3001/api/contact', contactFormData);
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
      const response = await axios.post('http://localhost:3001/api/subscribe', {
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

  // Handle Live Chat Button Click - Open WhatsApp Chat
  const handleLiveChat = () => {
    const phoneNumber = '004542223110'; // WhatsApp number
    const message = encodeURIComponent('Hello, I need assistance with your services.');
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <div className="contact-container">
      {/* Hero Slider Section */}
      <div className="hero-slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${slide.imageUrl})`,
            }}
            aria-hidden={index !== currentSlide}
          >
            <div className="slide-overlay"></div>
            <div className="slide-content">
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
              <Link to={slide.link}>
                <button className="cta-button">{slide.buttonText}</button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Information Section */}
      <section className="contact-info">
        <div className="info-grid">
          <div className="info-item">
            <FaEnvelope className="info-icon" />
            <h3>Email Us</h3>
            <p>support@travelplanner.com</p>
          </div>
          <div className="info-item">
            <FaComments className="info-icon" />
            <h3>Live Chat</h3>
            <p>Available for instant support</p>
          </div>
          <div className="info-item">
            <FaEnvelope className="info-icon" />
            <h3>Phone Support</h3>
            <p>+1 (800) 123-4567</p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="contact-form" className="contact-form-section">
        <div className="contact-form-content">
          <h2>Drop Us a Message</h2>
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
                aria-label="Your Name"
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
                aria-label="Your Email"
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
                aria-label="Your Message"
              ></textarea>
              <label htmlFor="message">Your Message</label>
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
          {contactFormStatus && <p className="form-status">{contactFormStatus}</p>}
        </div>
      </section>

      {/* Business Hours Section */}
      <section className="business-hours">
        <div className="hours-content">
          <h2>Business Hours</h2>
          <p>We are available during the following hours to assist you:</p>
          <div className="hours-grid">
            <div className="hours-item">
              <h3>Monday - Friday</h3>
              <p>9:00 AM - 6:00 PM</p>
            </div>
            <div className="hours-item">
              <h3>Saturday - Sunday</h3>
              <p>10:00 AM - 4:00 PM</p>
            </div>
            <div className="hours-item">
              <h3>We are online 24/7</h3>
              <p>Always here to assist you!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="additional-info">
        <div className="additional-content">
          <h2>Connect with Us</h2>
          <p>We're always here to help you with your travel plans. Choose the method that suits you best.</p>
          <div className="additional-options">
            <div className="option-item">
              <FaComments className="option-icon" />
              <h3>Live Chat</h3>
              <p>Instant messaging for quick queries.</p>
              <button className="option-btn" onClick={handleLiveChat}>Start Chat</button>
            </div>
            <div className="option-item">
              <FaEnvelope className="option-icon" />
              <h3>Email Support</h3>
              <p>Detailed assistance via email.</p>
              <a href="mailto:support@travelplanner.com" className="option-btn">Send Email</a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="contact-social">
        <div className="social-content">
          <h2>Stay Connected</h2>
          <p>Follow us on social media for the latest updates.</p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </section>

      {/* Live Chat Button */}
      <button className="live-chat-btn" onClick={handleLiveChat} aria-label="Live Chat">
        <FaComments />
      </button>
    </div>
  );
};

export default Contact;
