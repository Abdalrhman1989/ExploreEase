// src/components/Dashboard.jsx
import React, { useState, useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import { AuthContext } from '../context/AuthContext'; 

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext); 
  const navigate = useNavigate(); 

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await logout(); 
      navigate('/login'); 
    } catch (error) {
      console.error('Logout failed', error);
      alert('Failed to logout. Please try again.');
    }
  };

  const handleProfileNavigation = () => {
    navigate('/profile'); 
  };

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>Business Admin</h2>
        </div>
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <Link to="/business/dashboard">
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/business/hotels">
              <i className="fas fa-hotel"></i>
              <span>Hotels</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/business/restaurants">
              <i className="fas fa-utensils"></i>
              <span>Restaurants</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/business/attractions">
              <i className="fas fa-map-marker-alt"></i>
              <span>Attractions</span>
            </Link>
          </li>
          {/* Logout item */}
          <li className="sidebar-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </li>
        </ul>
      </aside>

      <div className="main-content">
        <nav className="top-nav">
          <div className="top-nav-left">
            <h2>Business Dashboard</h2>
          </div>
          <div className="top-nav-right">
            <div className="burger-menu" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </div>
            <div className="profile-dropdown">
              <img 
                src="https://via.placeholder.com/30" 
                alt="Profile" 
                onClick={handleProfileNavigation} 
              />
              <span>Profile</span>
            </div>
          </div>
        </nav>

        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
