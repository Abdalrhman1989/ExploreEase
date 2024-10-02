// src/components/admin/AdminSettings.jsx

import React from 'react';
import '../styles/AdminSettings.css';

const AdminSettings = () => {
  return (
    <div className="page-content">
      <h2>Admin Settings</h2>
      <div className="settings-form">
        <form>
          <div className="form-group">
            <label>Site Title</label>
            <input type="text" placeholder="Enter site title" />
          </div>
          <div className="form-group">
            <label>Admin Email</label>
            <input type="email" placeholder="Enter admin email" />
          </div>
          <div className="form-group">
            <label>Timezone</label>
            <select>
              <option>Select Timezone</option>
              <option>UTC</option>
              <option>GMT</option>
              {/* Add more timezones as needed */}
            </select>
          </div>
          <button type="submit" className="btn-save">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
