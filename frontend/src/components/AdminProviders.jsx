// src/components/admin/AdminProviders.jsx

import React, { useState, useEffect } from 'react';
import '../styles/AdminProviders.css';

const AdminProviders = () => {
  // Sample data
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    // Fetch providers from an API or use sample data
    const sampleProviders = [
      { id: 1, name: 'Provider One', service: 'Cleaning' },
      { id: 2, name: 'Provider Two', service: 'Plumbing' },
      { id: 3, name: 'Provider Three', service: 'Electrician' },
    ];
    setProviders(sampleProviders);
  }, []);

  return (
    <div className="page-content">
      <h2>Admin Providers Management</h2>
      <div className="providers-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Service</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(provider => (
              <tr key={provider.id}>
                <td>{provider.id}</td>
                <td>{provider.name}</td>
                <td>{provider.service}</td>
                <td>
                  <button className="btn-edit">Edit</button>
                  <button className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProviders;
