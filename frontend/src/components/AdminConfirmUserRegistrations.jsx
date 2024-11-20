import React, { useState, useEffect } from 'react';
import '../styles/AdminConfirmUserRegistrations.css';

const AdminConfirmUserRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    const data = [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', status: 'Pending' },
      { id: 2, name: 'Bob Brown', email: 'bob@example.com', status: 'Pending' },
    ];
    setTimeout(() => {
      setRegistrations(data);
      setLoading(false);
    }, 1000);
  };

  const handleApprove = (id) => {
    console.log(`User registration ${id} approved`);
    setRegistrations(registrations.filter((reg) => reg.id !== id));
  };

  const handleReject = (id) => {
    console.log(`User registration ${id} rejected`);
    setRegistrations(registrations.filter((reg) => reg.id !== id));
  };

  return (
    <div className="page-content">
      <h2>Confirm User Registrations</h2>
      <p>Approve or reject new user sign-ups.</p>
      {loading ? (
        <p>Loading registrations...</p>
      ) : registrations.length === 0 ? (
        <p>No pending registrations to display.</p>
      ) : (
        <table className="registrations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg.id}>
                <td>{reg.id}</td>
                <td>{reg.name}</td>
                <td>{reg.email}</td>
                <td>{reg.status}</td>
                <td>
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(reg.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(reg.id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminConfirmUserRegistrations;
