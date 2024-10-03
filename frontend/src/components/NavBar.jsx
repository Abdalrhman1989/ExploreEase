// src/components/Navbar.jsx

import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';
import '../styles/NavBar.css';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [menuActive, setMenuActive] = useState(false);
  const [languageMenuActive, setLanguageMenuActive] = useState(false);
  
  const { isAuthenticated, userRole } = useContext(AuthContext);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const toggleLanguageMenu = () => {
    setLanguageMenuActive(!languageMenuActive);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The AuthContext will automatically update the state
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">ExploreEase</Link>
      </div>
      <ul className={`navbar-links ${menuActive ? 'active' : ''}`}>
        <li><Link to="/stays" onClick={toggleMenu}>Stays</Link></li>
        <li><Link to="/flights" onClick={toggleMenu}>Flights</Link></li>
        <li><Link to="/car-rentals" onClick={toggleMenu}>Car Rentals</Link></li>
        <li><Link to="/attractions" onClick={toggleMenu}>Attractions</Link></li>
        <li><Link to="/trains" onClick={toggleMenu}>Trains</Link></li> {/* New Link */}
        <li><Link to="/buses" onClick={toggleMenu}>Buses</Link></li> {/* New Link */}
        <li><Link to="/restaurants" onClick={toggleMenu}>Restaurants</Link></li> {/* New Link */}
        {/* Conditionally render links based on user role */}
        {userRole === 'Admin' && (
          <li><Link to="/admin/dashboard" onClick={toggleMenu}>Admin Dashboard</Link></li>
        )}
        {userRole === 'BusinessAdministrator' && (
          <li><Link to="/business/dashboard" onClick={toggleMenu}>Business Dashboard</Link></li>
        )}
      </ul>
      <div className="navbar-right">
        <div className="navbar-language" onClick={toggleLanguageMenu}>
          <i className="fas fa-globe"></i>
          <span>English</span>
          {languageMenuActive && (
            <ul className="language-dropdown">
              <li><i className="fas fa-flag-usa"></i> English</li>
              <li><i className="fas fa-flag"></i> French</li>
              <li><i className="fas fa-flag"></i> German</li>
              {/* Add more languages as needed */}
            </ul>
          )}
        </div>
        {!isAuthenticated ? (
          <>
            <Link to="/register" className="auth-button">Register</Link>
            <Link to="/login" className="auth-button">Sign in</Link>
          </>
        ) : (
          <>
            <button onClick={handleLogout} className="auth-button">Logout</button>
          </>
        )}
      </div>
      <div className="navbar-menu" onClick={toggleMenu}>
        <span>&#9776;</span>
      </div>
    </nav>
  );
};

export default Navbar;
