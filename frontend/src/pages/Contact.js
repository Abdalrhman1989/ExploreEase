import React from 'react';
import '../styles/Contact.css';
import contactImage from '../assets/flight.jpg'; // Use the flight image as a background

const Contact = () => {
  return (
    <div className="contact-container">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="overlay">
          <div className="contact-hero-content">
            <h1>Get in Touch</h1>
            <p>We are here to assist you. Reach out for any inquiries or support.</p>
            <a href="#contact-form" className="contact-btn">Contact Us</a>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="contact-info">
        <div className="info-grid">
          <div className="info-item">
            <i className="fas fa-envelope"></i>
            <h3>Email Us</h3>
            <p>support@travelplanner.com</p>
          </div>
          <div className="info-item">
            <i className="fas fa-phone-alt"></i>
            <h3>Call Us</h3>
            <p>+1 (800) 123-4567</p>
          </div>
          <div className="info-item">
            <i className="fas fa-map-marker-alt"></i>
            <h3>Visit Us</h3>
            <p>1234 Travel St, Wanderlust City, WP 56789</p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="contact-form" className="contact-form-section">
        <div className="contact-form-content">
          <h2>Drop Us a Message</h2>
          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Your Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Your Message</label>
              <textarea id="message" name="message" required></textarea>
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
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
              <h3>Saturday</h3>
              <p>10:00 AM - 4:00 PM</p>
            </div>
            <div className="hours-item">
              <h3>Sunday</h3>
              <p>Closed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="contact-map">
        <h2>Find Us Here</h2>
        <iframe
          title="TravelPlanner Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.415420855531!2d144.95565761547995!3d-37.81720977975157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad6433c2d5a31ef%3A0x89b2d84b8e3a31c!2sFederation+Square!5e0!3m2!1sen!2sau!4v1550473771222"
          width="100%"
          height="400"
          frameBorder="0"
          allowFullScreen=""
          aria-hidden="false"
          tabIndex="0"
        ></iframe>
      </section>

      {/* Social Media Section */}
      <section className="contact-social">
        <div className="social-content">
          <h2>Stay Connected</h2>
          <p>Follow us on social media for the latest updates.</p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;