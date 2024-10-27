// src/pages/AdminDashboard.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Ensure the path is correct
import AdminUsers from '../components/AdminUsers';
// Removed AdminProviders import
import AdminBookings from '../components/AdminBookings';
import AdminConfirmBusinessOffers from '../components/AdminConfirmOffers';
// Removed AdminConfirmUserRegistrations import
import AdminPendingTestimonials from '../components/AdminPendingTestimonials'; // Import the new component
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeContent, setActiveContent] = useState('dashboard'); // Default content
  const navigate = useNavigate(); // Initialize useNavigate
  const { user, logout } = useContext(AuthContext); // Destructure logout and user from AuthContext

  // State variables for dynamic counts
  const [usersCount, setUsersCount] = useState(0);
  // Removed providersCount as Providers are no longer part of the dashboard
  const [bookingsCount, setBookingsCount] = useState(0);

  // Fetch dynamic counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No authentication token found.');
          return;
        }

        // Fetch Users Count
        const usersResponse = await fetch('/api/admin/users/count', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsersCount(usersData.count);
        } else {
          console.error('Failed to fetch users count.');
        }

        // Fetch Bookings Count
        const bookingsResponse = await fetch('/api/admin/bookings/count', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookingsCount(bookingsData.count);
        } else {
          console.error('Failed to fetch bookings count.');
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

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

  const handleProfileNavigation = () => {
    navigate('/profile'); // Navigate to the user profile page
    closeSidebar();
  };

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from AuthContext
      navigate('/login'); // Redirect to the login page after logout
    } catch (error) {
      console.error('Error during logout:', error);
      // Optionally, display an error message to the user
      alert('Failed to logout. Please try again.');
    }
  };

  const renderContent = () => {
    switch (activeContent) {
      case 'dashboard':
        return <DashboardHome /* You can pass any necessary props here */ />;
      case 'users':
        return <AdminUsers />;
      // Removed 'providers' case
      case 'bookings':
        return <AdminBookings />; // Combined Bookings Component
      case 'confirm-offers':
        return <AdminConfirmBusinessOffers />;
      // Removed 'confirm-registrations' case
      case 'pending-testimonials':
        return <AdminPendingTestimonials />; // Add this case
      default:
        return <DashboardHome />;
    }
  };

  // Function to get the first letter of the user's name
  const getUserInitial = () => {
    if (user && user.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return 'U'; // Default initial if name is not available
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>AdminPanel</h2>
          <button
            className="close-menu"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <ul className="sidebar-menu">
          <li
            className="sidebar-item"
            onClick={() => {
              setActiveContent('dashboard');
              closeSidebar();
            }}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </li>
          <li
            className="sidebar-item"
            onClick={() => {
              setActiveContent('users');
              closeSidebar();
            }}
          >
            <i className="fas fa-users"></i>
            <span>Users</span>
          </li>
          {/* Removed Providers Sidebar Item */}
          <li
            className="sidebar-item"
            onClick={() => {
              setActiveContent('bookings');
              closeSidebar();
            }}
          >
            <i className="fas fa-receipt"></i>
            <span>Bookings</span>
          </li>
          <li
            className="sidebar-item"
            onClick={() => {
              setActiveContent('confirm-offers');
              closeSidebar();
            }}
          >
            <i className="fas fa-tags"></i>
            <span>Business Offers</span>
          </li>
          {/* Removed User Registrations Sidebar Item */}
          {/* New Sidebar Item for Pending Testimonials */}
          <li
            className="sidebar-item"
            onClick={() => {
              setActiveContent('pending-testimonials');
              closeSidebar();
            }}
          >
            <i className="fas fa-comments"></i>
            <span>Pending Testimonials</span>
          </li>
          {/* Logout Item */}
          <li
            className="sidebar-item"
            onClick={() => {
              handleLogout();
              closeSidebar();
            }}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </li>
        </ul>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close sidebar overlay"
        ></div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Top Navigation */}
        <nav className="top-nav">
          <div className="top-nav-left">
            <button
              className="burger-menu"
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              <i className="fas fa-bars"></i>
            </button>
            <h2>Dashboard</h2>
          </div>
          <div className="top-nav-right">
            <div className="profile-dropdown">
              <img
                src={
                  user && user.photoURL
                    ? user.photoURL
                    : 'https://via.placeholder.com/30'
                }
                alt="Profile"
                onClick={handleProfileNavigation} // Make the profile icon clickable
                className="profile-avatar"
              />
              <span>{user ? user.displayName || 'Admin' : 'Admin'}</span>
              <i className="fas fa-chevron-down"></i>
              <ul className="dropdown-menu">
                <li onClick={handleProfileNavigation}>Profile</li>
                {/* You can add more dropdown items here if needed */}
              </ul>
            </div>
          </div>
        </nav>

        {/* Dynamic Content based on menu selection */}
        {renderContent()}
      </div>
    </div>
  );
};

// DashboardHome Component Defined Inside AdminDashboard.jsx
const DashboardHome = () => {
  return (
    <div className="dashboard-home">
      {/* Welcome Message */}
      <h1>Welcome to the Admin Dashboard</h1>
      <p>Select an option from the sidebar to get started.</p>

      {/* You can add more components or information here as needed */}
    </div>
  );
};

export default AdminDashboard;
