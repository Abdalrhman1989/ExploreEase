// src/components/BusinessOverview.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/BusinessOverview.css';

const BusinessOverview = () => {
  return (
    <div className="dashboard-overview">
      <Link to="/business/manage-hotels" className="overview-card">
        <div className="overview-icon">
          <i className="fas fa-hotel"></i>
        </div>
        <div className="overview-info">
          <h3>Manage Hotels</h3>
          <p>View, edit, and delete hotel listings</p>
        </div>
      </Link>

      <Link to="/business/manage-restaurants" className="overview-card">
        <div className="overview-icon">
          <i className="fas fa-utensils"></i>
        </div>
        <div className="overview-info">
          <h3>Manage Restaurants</h3>
          <p>View, edit, and delete restaurant listings</p>
        </div>
      </Link>

      <Link to="/business/manage-attractions" className="overview-card">
        <div className="overview-icon">
          <i className="fas fa-map-marker-alt"></i>
        </div>
        <div className="overview-info">
          <h3>Manage Attractions</h3>
          <p>View, edit, and delete attraction listings</p>
        </div>
      </Link>
      
      {/* You can add more overview cards here */}
    </div>
  );
};

export default BusinessOverview;
