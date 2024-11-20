import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 
import AdminUsers from '../components/AdminUsers';
import AdminBookings from '../components/AdminBookings';
import AdminConfirmBusinessOffers from '../components/AdminConfirmOffers';
import AdminPendingTestimonials from '../components/AdminPendingTestimonials'; 
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeContent, setActiveContent] = useState('dashboard'); 
  const navigate = useNavigate(); 
  const { user, logout } = useContext(AuthContext); 
  const [usersCount, setUsersCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);


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
    navigate('/profile'); 
    closeSidebar();
  };

  const handleLogout = async () => {
    try {
      await logout(); 
      navigate('/login'); 
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  const renderContent = () => {
    switch (activeContent) {
      case 'dashboard':
        return <DashboardHome />;
      case 'users':
        return <AdminUsers />;
      case 'bookings':
        return <AdminBookings />; 
      case 'confirm-offers':
        return <AdminConfirmBusinessOffers />;
      case 'pending-testimonials':
        return <AdminPendingTestimonials />; 
      default:
        return <DashboardHome />;
    }
  };

  const getUserInitial = () => {
    if (user && user.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return 'U'; 
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
                onClick={handleProfileNavigation} 
                className="profile-avatar"
              />
              <span>{user ? user.displayName || 'Admin' : 'Admin'}</span>
              <i className="fas fa-chevron-down"></i>
              <ul className="dropdown-menu">
              </ul>
            </div>
          </div>
        </nav>

        {renderContent()}
      </div>
    </div>
  );
};

// DashboardHome Component
const DashboardHome = () => {
  return (
    <div className="dashboard-home">
      {/* Welcome Message */}
      <h1>Welcome to the Admin Dashboard</h1>
      <p>Select an option from the sidebar to get started.</p>
    </div>
  );
};

export default AdminDashboard;
