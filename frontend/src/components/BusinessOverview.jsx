// src/components/BusinessOverview.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/BusinessOverview.css';

const BusinessOverview = () => {
  return (
    <div className="dashboard-overview">
      <Link to="/business/hotels" className="overview-card">
        <div className="overview-icon">
          <i className="fas fa-hotel"></i>
        </div>
        <div className="overview-info">
          <h3>Manage Hotels</h3>
          <p>View and manage hotel listings</p>
        </div>
      </Link>

      <Link to="/business/flights" className="overview-card">
        <div className="overview-icon">
          <i className="fas fa-plane"></i>
        </div>
        <div className="overview-info">
          <h3>Manage Flights</h3>
          <p>View and manage flight listings</p>
        </div>
      </Link>

      <Link to="/business/car-rentals" className="overview-card">
        <div className="overview-icon">
          <i className="fas fa-car"></i>
        </div>
        <div className="overview-info">
          <h3>Manage Car Rentals</h3>
          <p>View and manage car rental listings</p>
        </div>
      </Link>

      <Link to="/business/trains" className="overview-card">
        <div className="overview-icon">
          <i className="fas fa-train"></i>
        </div>
        <div className="overview-info">
          <h3>Manage Trains</h3>
          <p>View and manage train listings</p>
        </div>
      </Link>

      <Link to="/business/buses" className="overview-card">
        <div className="overview-icon">
          <i className="fas fa-bus"></i>
        </div>
        <div className="overview-info">
          <h3>Manage Buses</h3>
          <p>View and manage bus listings</p>
        </div>
      </Link>

      <Link to="/business/restaurants" className="overview-card">
        <div className="overview-icon">
          <i className="fas fa-utensils"></i>
        </div>
        <div className="overview-info">
          <h3>Manage Restaurants</h3>
          <p>View and manage restaurant listings</p>
        </div>
      </Link>

      <Link to="/business/attractions" className="overview-card">
        <div className="overview-icon">
          <i className="fas fa-map-marker-alt"></i>
        </div>
        <div className="overview-info">
          <h3>Manage Attractions</h3>
          <p>View and manage attraction listings</p>
        </div>
      </Link>

      <Link to="/business/users" className="overview-card">
        <div className="overview-icon">
          <i className="fas fa-users"></i>
        </div>
        <div className="overview-info">
          <h3>Manage Users</h3>
          <p>View and manage user accounts</p>
        </div>
      </Link>

      <Link to="/business/settings" className="overview-card">
        <div className="overview-icon">
          <i className="fas fa-cog"></i>
        </div>
        <div className="overview-info">
          <h3>Settings</h3>
          <p>Configure dashboard settings</p>
        </div>
      </Link>
    </div>
  );
};

export default BusinessOverview;
