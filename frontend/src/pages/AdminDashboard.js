import React, { useState, useEffect } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import AdminUsers from '../components/AdminUsers';
import AdminProviders from '../components/AdminProviders';
import AdminBookings from '../components/AdminBookings';
import AdminConfirmBookings from '../components/AdminConfirmBookings';
import AdminManageBookings from '../components/AdminManageBookings';
import AdminConfirmBusinessOffers from '../components/AdminConfirmBusinessOffers';
import AdminConfirmUserRegistrations from '../components/AdminConfirmUserRegistrations';
import AdminReports from '../components/AdminReports';
import AdminSettings from '../components/AdminSettings';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>AdminPanel</h2>
          <div className="close-menu" onClick={toggleSidebar}>
            <i className="fas fa-times"></i>
          </div>
        </div>
        <ul className="sidebar-menu">
          <li className="sidebar-item" onClick={closeSidebar}>
            <Link to="">
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="sidebar-item" onClick={closeSidebar}>
            <Link to="users">
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
          </li>
          <li className="sidebar-item" onClick={closeSidebar}>
            <Link to="providers">
              <i className="fas fa-briefcase"></i>
              <span>Providers</span>
            </Link>
          </li>
          <li className="sidebar-item" onClick={closeSidebar}>
            <Link to="bookings">
              <i className="fas fa-receipt"></i>
              <span>Bookings</span>
            </Link>
          </li>
          <li className="sidebar-item" onClick={closeSidebar}>
            <Link to="confirm-bookings">
              <i className="fas fa-check-circle"></i>
              <span>Confirm Bookings</span>
            </Link>
          </li>
          <li className="sidebar-item" onClick={closeSidebar}>
            <Link to="manage-bookings">
              <i className="fas fa-tasks"></i>
              <span>Manage Bookings</span>
            </Link>
          </li>
          <li className="sidebar-item" onClick={closeSidebar}>
            <Link to="confirm-offers">
              <i className="fas fa-tags"></i>
              <span>Business Offers</span>
            </Link>
          </li>
          <li className="sidebar-item" onClick={closeSidebar}>
            <Link to="confirm-registrations">
              <i className="fas fa-user-check"></i>
              <span>User Registrations</span>
            </Link>
          </li>
          <li className="sidebar-item" onClick={closeSidebar}>
            <Link to="reports">
              <i className="fas fa-chart-line"></i>
              <span>Reports</span>
            </Link>
          </li>
          <li className="sidebar-item" onClick={closeSidebar}>
            <Link to="settings">
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Main Content */}
      <div className="main-content">
        {/* Top Navigation */}
        <nav className="top-nav">
          <div className="top-nav-left">
            <div className="burger-menu" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </div>
            <h2>Dashboard</h2>
          </div>
          <div className="top-nav-right">
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

        {/* Admin Routes */}
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="confirm-bookings" element={<AdminConfirmBookings />} />
          <Route path="manage-bookings" element={<AdminManageBookings />} />
          <Route path="confirm-offers" element={<AdminConfirmBusinessOffers />} />
          <Route path="confirm-registrations" element={<AdminConfirmUserRegistrations />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  return (
    <div>
      {/* Dashboard Overview */}
      <div className="dashboard-overview">
        <Link to="users" className="overview-card">
          <div className="overview-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="overview-info">
            <h3>300 Users</h3>
          </div>
        </Link>
        <Link to="providers" className="overview-card">
          <div className="overview-icon">
            <i className="fas fa-briefcase"></i>
          </div>
          <div className="overview-info">
            <h3>75 Providers</h3>
          </div>
        </Link>
        <Link to="bookings" className="overview-card">
          <div className="overview-icon">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="overview-info">
            <h3>1,200 Bookings</h3>
          </div>
        </Link>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="card-info">
            <h3>Confirm Bookings</h3>
            <p>Approve or reject user bookings</p>
            <Link to="confirm-bookings">View Details</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">
            <i className="fas fa-tasks"></i>
          </div>
          <div className="card-info">
            <h3>Manage Bookings</h3>
            <p>Edit or cancel existing bookings</p>
            <Link to="manage-bookings">View Details</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">
            <i className="fas fa-tags"></i>
          </div>
          <div className="card-info">
            <h3>Business Offers</h3>
            <p>Approve or reject offers from businesses</p>
            <Link to="confirm-offers">View Details</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="card-info">
            <h3>User Registrations</h3>
            <p>Approve new user sign-ups</p>
            <Link to="confirm-registrations">View Details</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
