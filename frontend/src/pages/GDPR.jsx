import React from 'react';
import '../styles/GDPR.css';
import flightImage from '../assets/flight.jpg'; // Import the image

const GDPR = () => {
  return (
    <div className="gdpr-container">
      <section className="gdpr-hero" style={{ backgroundImage: `url(${flightImage})` }}>
        <div className="gdpr-hero-content">
          <h1>GDPR Compliance</h1>
          <p>Your data privacy is our top priority.</p>
        </div>
      </section>

      <section className="gdpr-overview">
        <h2>What is GDPR?</h2>
        <p>The General Data Protection Regulation (GDPR) is a regulation in EU law on data protection and privacy. It also addresses the transfer of personal data outside the EU and EEA areas. We are committed to complying with GDPR regulations and ensuring your data is protected.</p>
      </section>

      <section className="gdpr-rights">
        <h2>Your Rights Under GDPR</h2>
        <p>As a user, you have the following rights under GDPR:</p>
        <ul>
          <li><strong>Right to Access:</strong> You can request access to your personal data.</li>
          <li><strong>Right to Rectification:</strong> You can request corrections to your data if it’s inaccurate.</li>
          <li><strong>Right to Erasure:</strong> You can request the deletion of your data.</li>
          <li><strong>Right to Restrict Processing:</strong> You can request limitations on how we use your data.</li>
          <li><strong>Right to Data Portability:</strong> You can request your data in a machine-readable format.</li>
        </ul>
      </section>

      <section className="gdpr-compliance">
        <h2>Our Compliance</h2>
        <p>We have implemented the following measures to comply with GDPR:</p>
        <ul>
          <li>Data encryption and anonymization.</li>
          <li>Regular security audits.</li>
          <li>Strict access control policies.</li>
          <li>Clear and transparent privacy policies.</li>
        </ul>
      </section>

      <section className="gdpr-contact">
        <h2>Contact Us</h2>
        <p>If you have any questions or concerns about our GDPR compliance, please contact us:</p>
        <ul>
          <li>Email: privacy@travelplanner.com</li>
          <li>Phone: +1 (800) 123-4567</li>
        </ul>
      </section>
    </div>
  );
};

export default GDPR;