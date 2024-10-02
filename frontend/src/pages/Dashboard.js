import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>TravelAdmin</h2>
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
            <Link to="/business/flights">
              <i className="fas fa-plane"></i>
              <span>Flights</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/business/car-rentals">
              <i className="fas fa-car"></i>
              <span>Car Rentals</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/business/trains">
              <i className="fas fa-train"></i>
              <span>Trains</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/business/buses">
              <i className="fas fa-bus"></i>
              <span>Buses</span>
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
          <li className="sidebar-item">
            <Link to="/business/users">
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/business/settings">
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </aside>

      <div className="main-content">
        <nav className="top-nav">
          <div className="top-nav-left">
            <h2>Dashboard</h2>
          </div>
          <div className="top-nav-right">
            <div className="burger-menu" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </div>
            <div className="profile-dropdown">
              <img src="https://via.placeholder.com/30" alt="Profile" />
              <span>Admin</span>
              <i className="fas fa-chevron-down"></i>
              <ul className="dropdown-menu">
                <li>Profile</li>
                <li>Settings</li>
                <li>Logout</li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Render Nested Routes */}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
