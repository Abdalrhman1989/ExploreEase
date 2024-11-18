import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Support.css';
import {
  FaEnvelope,
  FaComments,
  FaSearch,
  FaBook,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPaperPlane,
  FaCheckCircle,
} from 'react-icons/fa';
import axios from 'axios';


import hotelImage from '../assets/hotel.jpg';
import flightImage from '../assets/flight.jpg';
import carRentalImage from '../assets/carrenter.jpg';
import trainImage from '../assets/train1.jpg';
import busImage from '../assets/bus1.jpg';
import restaurantImage from '../assets/Restaurant1.jpg';

import Accordion from '../components/Accordion';
import Modal from '../components/Modal';

const Support = () => {
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [contactFormStatus, setContactFormStatus] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [resources] = useState([
    {
      id: 1,
      category: 'Travel Guides',
      title: 'Top 10 Destinations for 2024',
      description: 'Explore the most popular destinations for your next trip.',
      link: '/travel-guides/top-10-destinations-2024',
    },
    {
      id: 2,
      category: 'Booking Tips',
      title: 'How to Get the Best Deals on Flights',
      description: 'Learn strategies to secure the best flight prices.',
      link: '/booking-tips/best-deals-on-flights',
    },
    {
      id: 3,
      category: 'FAQs',
      title: 'Booking and Payment Questions',
      description: 'Find answers to common booking and payment-related questions.',
      link: '/faq',
    },
    {
      id: 4,
      category: 'Video Tutorials',
      title: 'Navigating Our Booking System',
      description: 'Watch our step-by-step guide to using our booking platform.',
      link: '/video-tutorials/navigating-booking-system',
    },
  ]);

  // Filtered Resources based on search
  const [searchTerm, setSearchTerm] = useState('');
  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Persist Form Data on Page Refresh
  useEffect(() => {
    const savedData = localStorage.getItem('contactFormData');
    if (savedData) {
      setContactFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('contactFormData', JSON.stringify(contactFormData));
  }, [contactFormData]);

  // Handle Contact Form input changes
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactFormData({
      ...contactFormData,
      [name]: value,
    });
  };

  // Handle Contact Form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactFormStatus('Submitting your message...');
    setValidationErrors({});
    setIsSubmitting(true); 

    try {
      const response = await axios.post('http://localhost:3001/api/contact', contactFormData);
      if (response.data.success) {
        setContactFormStatus('Your message has been sent successfully!');
        setContactFormData({
          name: '',
          email: '',
          message: '',
        });
        setIsModalOpen(true); 
        localStorage.removeItem('contactFormData'); 
      } else {
        setContactFormStatus('Failed to send your message. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response && error.response.data) {
        const errors = error.response.data.errors; 
        const errorObj = {};

        if (Array.isArray(errors)) {
          errors.forEach(err => {
            errorObj[err.path] = err.msg;
          });
        } else if (typeof errors === 'object') {
          // If errors is an object, convert it to an array
          Object.values(errors).forEach(err => {
            errorObj[err.path] = err.msg;
          });
        } else {
          setContactFormStatus('An unexpected error occurred. Please try again.');
          return;
        }

        setValidationErrors(errorObj);
        setContactFormStatus('Please correct the highlighted errors and try again.');
      } else {
        setContactFormStatus('An error occurred while sending your message. Please try again later.');
      }
    } finally {
      setIsSubmitting(false); 
    }
  };

  // Handle Live Chat Button Click - Open WhatsApp Chat
  const handleLiveChat = () => {
    const phoneNumber = '004542223110'; 
    const message = encodeURIComponent('Hello, I need assistance with your services.');
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <div className="support-container">
      {/* Support Ticket Submission Section */}
      <section className="support-ticket" aria-labelledby="support-ticket-heading">
        <div className="ticket-content">
          <h2 id="support-ticket-heading">Submit a Support Ticket</h2>
          <form className="ticket-form" onSubmit={handleContactSubmit}>
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
              <label htmlFor="name">Your Name <span className="required">*</span></label>
              {validationErrors.name && <span className="error-text">{validationErrors.name}</span>}
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
              <label htmlFor="email">Your Email <span className="required">*</span></label>
              {validationErrors.email && <span className="error-text">{validationErrors.email}</span>}
            </div>
            <div className="form-group">
              <textarea
                id="message"
                name="message"
                value={contactFormData.message}
                onChange={handleContactChange}
                required
                placeholder=" "
                aria-label="Message"
              ></textarea>
              <label htmlFor="message">Message <span className="required">*</span></label>
              {validationErrors.message && <span className="error-text">{validationErrors.message}</span>}
            </div>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : <><FaPaperPlane className="submit-icon" /> Submit Ticket</>}
            </button>
          </form>
          {contactFormStatus && <p className="form-status">{contactFormStatus}</p>}
        </div>
      </section>

      {/* Support Resources Section */}
      <section className="support-resources" aria-labelledby="support-resources-heading">
        <div className="resources-content">
          <h2 id="support-resources-heading">Support Resources</h2>
          <p>Find answers and enhance your travel experience with our curated resources.</p>
          <div className="resources-search">
            <FaSearch className="search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search Support Resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search Support Resources"
            />
          </div>
          <div className="resources-grid">
            {filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <div key={resource.id} className="resource-item">
                  <FaBook className="resource-icon" aria-hidden="true" />
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <Link to={resource.link} className="resource-link" aria-label={`Learn more about ${resource.title}`}>
                    Learn More
                  </Link>
                </div>
              ))
            ) : (
              <p>No resources match your search.</p>
            )}
          </div>
        </div>
      </section>

      {/* Additional Support Features */}
      <section className="additional-support" aria-labelledby="additional-support-heading">
        <div className="additional-content">
          <h2 id="additional-support-heading">Additional Support Options</h2>
          <div className="support-options">
            <div className="option-item">
              <FaComments className="option-icon" aria-hidden="true" />
              <h3>Live Chat</h3>
              <p>Instant messaging for quick queries.</p>
              <button className="option-btn" onClick={handleLiveChat} aria-label="Start Live Chat">
                Start Chat
              </button>
            </div>
            <div className="option-item">
              <FaEnvelope className="option-icon" aria-hidden="true" />
              <h3>Email Support</h3>
              <p>Detailed assistance via email.</p>
              <a href="mailto:support@travelplanner.com" className="option-btn" aria-label="Send Email">
                Send Email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="support-social" aria-labelledby="support-social-heading">
        <div className="social-content">
          <h2 id="support-social-heading">Stay Connected</h2>
          <p>Follow us on social media for the latest updates and offers.</p>
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

      {/* Confirmation Modal */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="modal-content">
            <FaCheckCircle className="modal-icon success" />
            <h2>Thank You!</h2>
            <p>Your support ticket has been submitted successfully. Our team will get back to you shortly.</p>
            <button onClick={() => setIsModalOpen(false)} className="close-modal-btn" aria-label="Close Modal">
              Close
            </button>
          </div>
        </Modal>
      )}
      <button className="live-chat-btn" onClick={handleLiveChat} aria-label="Live Chat">
        <FaComments />
      </button>
    </div>
  );
};

export default Support;
