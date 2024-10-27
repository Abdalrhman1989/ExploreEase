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
      
      {/* Removed the Settings card */}
    </div>
  );
};

export default BusinessOverview;
