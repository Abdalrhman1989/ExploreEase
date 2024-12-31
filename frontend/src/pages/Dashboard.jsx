import React, { useState, useContext, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Dashboard.css';
import { AuthContext } from '../context/AuthContext'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext); 
  const navigate = useNavigate(); 
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await logout(); 
      navigate('/login'); 
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout failed', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const handleProfileNavigation = () => {
    navigate('/profile'); 
    setSidebarOpen(false); 
  };

  // Close sidebar when navigating to a new route
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>ExploreEase</h2>
          <button className="close-sidebar" onClick={toggleSidebar} aria-label="Close Sidebar">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${location.pathname === '/business/dashboard' ? 'active' : ''}`}>
            <Link to="/business/dashboard">
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={`sidebar-item ${location.pathname.includes('/business/hotels') ? 'active' : ''}`}>
            <Link to="/business/hotels">
              <i className="fas fa-hotel"></i>
              <span>Hotels</span>
            </Link>
          </li>
          <li className={`sidebar-item ${location.pathname.includes('/business/restaurants') ? 'active' : ''}`}>
            <Link to="/business/restaurants">
              <i className="fas fa-utensils"></i>
              <span>Restaurants</span>
            </Link>
          </li>
          <li className={`sidebar-item ${location.pathname.includes('/business/attractions') ? 'active' : ''}`}>
            <Link to="/business/attractions">
              <i className="fas fa-map-marker-alt"></i>
              <span>Attractions</span>
            </Link>
          </li>
          {/* Logout item */}
          <li className="sidebar-item logout-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </li>
        </ul>
      </aside>

      {/* Overlay for sidebar on mobile */}
      <div className={`overlay ${sidebarOpen ? 'open' : ''}`} onClick={toggleSidebar} aria-hidden="true"></div>

      <div className="main-content">
        <nav className="top-nav">
          <div className="top-nav-left">
            <button className="burger-menu" onClick={toggleSidebar} aria-label="Toggle Sidebar">
              <i className="fas fa-bars"></i>
            </button>
            <h2>Business Dashboard</h2>
          </div>
          <div className="top-nav-right">
            <div className="profile-dropdown">
              <img 
                src="https://via.placeholder.com/30" 
                alt="Profile" 
                onClick={handleProfileNavigation} 
                aria-label="Profile"
              />
              {/* Removed the <span>Profile</span> */}
            </div>
          </div>
        </nav>

        <Outlet />

        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default Dashboard;
