import React, { useState } from 'react';
import '../styles/GDPR.css';
import flightImage from '../assets/flight.jpg'; // Import the image

const GDPR = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here (e.g., send data to server)
    console.log(formData);
    alert('Your message has been sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="gdpr-container">
      {/* ... other sections ... */}

      <section className="gdpr-contact">
        <h2>Contact Us</h2>
        <p>If you have any questions or concerns about our GDPR compliance, please contact us:</p>
        <ul>
          <li>Email: <a href="mailto:explore.ease.world@gmail.com">explore.ease.world@gmail.com</a></li>
          <li>Phone: +1 (800) 123-4567</li>
        </ul>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit">Send Message</button>
        </form>
      </section>
    </div>
  );
};

export default GDPR;
