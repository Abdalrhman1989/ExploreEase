import React from 'react';
import { Link } from 'react-router-dom'; 
import '../styles/Footer.css'; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footerContainer">
        {/* Column 1 - Company */}
        <div className="column">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>

        {/* Column 2 - Products */}
        <div className="column">
          <h4>Products</h4>
          <ul>
            <li><Link to="/flights">Flights</Link></li>
            <li><Link to="/hotels">Hotels</Link></li>
            <li><Link to="/cars">Car Rentals</Link></li>
            <li><Link to="/attractions">Attractions</Link></li>
            <li><Link to="/restaurants">Restaurants</Link></li>
          </ul>
        </div>

        {/* Column 3 - Policies */}
        <div className="column">
          <h4>Policies</h4>
          <ul>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/gdpr">GDPR Compliance</Link></li>
          </ul>
        </div>

        {/* Column 4 - Help */}
        <div className="column">
          <h4>Help</h4>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/support">Support</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      
      {/* Social Media Links */}
      <div className="socialLinks">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>

      {/* Footer Bottom */}
      <div className="footerBottom">
        <p>© 2024 TravelPlanner. All rights reserved.</p>
        <p><Link to="/privacy">Privacy</Link> | <Link to="/terms">Terms</Link></p>
        <div className="languageLocation">
          <span>English</span> | <span>Global</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
