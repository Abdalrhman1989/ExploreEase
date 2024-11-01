// src/components/NavBar.jsx

import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/NavBar.css';
import { AuthContext } from '../context/AuthContext';
import ReactCountryFlag from 'react-country-flag';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { MdLanguage } from 'react-icons/md'; // Corrected import

const Navbar = () => {
  const [menuActive, setMenuActive] = useState(false);
  const [languageMenuActive, setLanguageMenuActive] = useState(false);
  
  const { isAuthenticated, userRole, user } = useContext(AuthContext);
  console.log('Navbar - isAuthenticated:', isAuthenticated);
  console.log('Navbar - userRole:', userRole);
  console.log('Navbar - user:', user);

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

  // Placeholder for language change logic
  const changeLanguage = (lng) => {
    // Implement language change logic if needed
    setLanguageMenuActive(false);
    console.log(`Language changed to: ${lng}`);
  };

  // Function to get the first letter of the user's name
  const getUserInitial = () => {
    if (user && user.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return 'U'; // Default initial if name is not available
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">ExploreEase</Link>
      </div>
      <div className="navbar-menu" onClick={toggleMenu} aria-label="Toggle navigation menu">
        {menuActive ? <FaTimes /> : <FaBars />}
      </div>
      <ul className={`navbar-links ${menuActive ? 'active' : ''}`}>
        <li><Link to="/stays" onClick={toggleMenu}>Stays</Link></li>
        <li><Link to="/flights" onClick={toggleMenu}>Flights</Link></li>
        <li><Link to="/car-rentals" onClick={toggleMenu}>Car Rentals</Link></li>
        <li><Link to="/attractions" onClick={toggleMenu}>Attractions</Link></li>
        <li><Link to="/trains" onClick={toggleMenu}>Trains</Link></li>
        <li><Link to="/buses" onClick={toggleMenu}>Buses</Link></li>
        <li><Link to="/restaurants" onClick={toggleMenu}>Restaurants</Link></li>
        {/* Conditionally render links based on user role */}
        {userRole === 'Admin' && (
          <li><Link to="/admin/dashboard" onClick={toggleMenu}>Admin Dashboard</Link></li>
        )}
        {userRole === 'BusinessAdministrator' && (
          <li><Link to="/business/dashboard" onClick={toggleMenu}>Business Dashboard</Link></li>
        )}
        {/* Authentication Buttons for Mobile */}
        <li className="mobile-auth">
          {!isAuthenticated ? (
            <>
              <Link to="/register" className="auth-button" onClick={toggleMenu}>Register</Link>
              <Link to="/login" className="auth-button" onClick={toggleMenu}>Sign in</Link>
            </>
          ) : (
            <>
              <button onClick={() => { handleLogout(); toggleMenu(); }} className="auth-icon-button" title="Logout">
                <FaSignOutAlt />
              </button>
              <Link to="/profile" className="profile-link" onClick={toggleMenu} title="Profile">
                {user && user.photoURL ? (
                  <img src={user.photoURL} alt={`${user.displayName}'s Profile`} className="profile-avatar" />
                ) : (
                  <div className="profile-initial">
                    {getUserInitial()}
                  </div>
                )}
              </Link>
            </>
          )}
        </li>
      </ul>
      <div className="navbar-right">
        {!isAuthenticated ? (
          <>
            <Link to="/register" className="auth-button">Register</Link>
            <Link to="/login" className="auth-button">Sign in</Link>
          </>
        ) : (
          <>
            <div className="navbar-language" onClick={toggleLanguageMenu}>
              <MdLanguage size={20} /> {/* Updated icon */}
              <span className="language-text">English</span>
              <span className="dropdown-arrow">&#9662;</span>
              {languageMenuActive && (
                <ul className="language-dropdown">
                  <li onClick={() => changeLanguage('en')}>
                    <ReactCountryFlag
                      countryCode="US"
                      svg
                      style={{
                        width: '1.2em',
                        height: '1.2em',
                      }}
                      title="US"
                    /> English
                  </li>
                  <li onClick={() => changeLanguage('fr')}>
                    <ReactCountryFlag
                      countryCode="FR"
                      svg
                      style={{
                        width: '1.2em',
                        height: '1.2em',
                      }}
                      title="FR"
                    /> French
                  </li>
                  <li onClick={() => changeLanguage('de')}>
                    <ReactCountryFlag
                      countryCode="DE"
                      svg
                      style={{
                        width: '1.2em',
                        height: '1.2em',
                      }}
                      title="DE"
                    /> German
                  </li>
                  {/* Add more languages as needed */}
                </ul>
              )}
            </div>
            <button onClick={handleLogout} className="auth-icon-button" title="Logout">
              <FaSignOutAlt size={20} />
            </button>
            {/* User Profile Icon */}
            <Link to="/profile" className="profile-link" title="Profile">
              {user && user.photoURL ? (
                <img src={user.photoURL} alt={`${user.displayName}'s Profile`} className="profile-avatar" />
              ) : (
                <div className="profile-initial">
                  {getUserInitial()}
                </div>
              )}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
