// src/components/admin/AdminUsers.jsx

import React, { useState, useEffect } from 'react';
import '../styles/AdminUsers.css';

const AdminUsers = () => {
  // Sample data
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from an API or use sample data
    const sampleUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
      { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
    ];
    setUsers(sampleUsers);
  }, []);

  return (
    <div className="page-content">
      <h2>Admin Users Management</h2>
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
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

export default AdminUsers;
