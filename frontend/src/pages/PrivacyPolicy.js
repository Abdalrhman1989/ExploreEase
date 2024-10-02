import React from 'react';
import '../styles/PrivacyPolicy.css';
import flightImage from '../assets/flight.jpg'; // Import the image

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      <section className="privacy-hero" style={{ backgroundImage: `url(${flightImage})` }}>
        <div className="privacy-hero-content">
          <h1>Privacy Policy</h1>
          <p>Your privacy is important to us. This policy outlines how we handle your personal information.</p>
        </div>
      </section>

      <section className="privacy-introduction">
        <h2>Introduction</h2>
        <p>At TravelPlanner, we are committed to protecting your privacy. This policy explains how we collect, use, and protect your personal information when you use our services.</p>
      </section>

      <section className="privacy-collection">
        <h2>Information We Collect</h2>
        <p>We collect information that you provide directly to us when you use our services, such as when you create an account, book travel services, or contact us for support. This includes:</p>
        <ul>
          <li>Personal identification information (name, email address, phone number, etc.)</li>
          <li>Payment information (credit card details, billing address, etc.)</li>
          <li>Travel preferences and history.</li>
        </ul>
      </section>

      <section className="privacy-use">
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide and personalize our services.</li>
          <li>Process your bookings and payments.</li>
          <li>Send you service-related notifications and updates.</li>
          <li>Improve our platform and customer experience.</li>
        </ul>
      </section>

      <section className="privacy-sharing">
        <h2>Sharing Your Information</h2>
        <p>We do not share your personal information with third parties except in the following circumstances:</p>
        <ul>
          <li>When required by law or to comply with legal processes.</li>
          <li>With trusted partners to provide our services (e.g., airlines, hotels).</li>
          <li>To protect the rights, property, or safety of TravelPlanner, our users, or others.</li>
        </ul>
      </section>

      <section className="privacy-security">
        <h2>Security of Your Information</h2>
        <p>We take the security of your personal information seriously and use industry-standard measures to protect it. This includes encryption, secure data storage, and access controls.</p>
      </section>

      <section className="privacy-rights">
        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you.</li>
          <li>Request corrections to your personal information.</li>
          <li>Request the deletion of your personal information.</li>
          <li>Opt-out of receiving marketing communications from us.</li>
        </ul>
      </section>

      <section className="privacy-contact">
        <h2>Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <ul>
          <li>Email: privacy@travelplanner.com</li>
          <li>Phone: +1 (800) 123-4567</li>
        </ul>
      </section>
    </div>
  );
};

export default PrivacyPolicy;