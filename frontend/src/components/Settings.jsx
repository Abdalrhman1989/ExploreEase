// src/components/Settings.jsx
import React, { useState } from 'react';
import '../styles/Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteTitle: '',
    adminEmail: '',
    // Add more settings fields as needed
  });

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement settings update logic (e.g., API call)
    console.log('Settings Updated:', settings);
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Site Title</label>
          <input
            type="text"
            name="siteTitle"
            value={settings.siteTitle}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Admin Email</label>
          <input
            type="email"
            name="adminEmail"
            value={settings.adminEmail}
            onChange={handleChange}
            required
          />
        </div>
        {/* Add more settings fields as needed */}
        <button type="submit" className="submit-button">
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default Settings;
