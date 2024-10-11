// frontend/src/App.js

import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useContext } from 'react'; // Import useContext
import Home from './pages/Home';
import Stays from './pages/Stays';
import Flights from './pages/Flights';
import CarRentals from './pages/CarRentals';
import Attractions from './pages/Attractions';
import Trains from './pages/Trains';
import Buses from './pages/Buses';
import Restaurants from './pages/Restaurants';
import Navbar from './components/NavBar.jsx';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import BusinessDashboard from './pages/Dashboard';
import Destination from './pages/Destination';
import Booking from './pages/Booking';
import FlightResults from './pages/FlightResults';
import StaysResults from './pages/StaysResults';
import CarRentalsResults from './pages/CarRentalsResults';
import AttractionsResults from './pages/AttractionsResults';
import About from './pages/About';
import Contact from './pages/Contact';
import GDPR from './pages/GDPR';
import PrivacyPolicy from './pages/PrivacyPolicy';
import HotelForm from './components/HotelForm';
import FlightForm from './components/FlightForm';
import CarRentalForm from './components/CarRentalForm';
import TrainForm from './components/TrainForm';
import BusForm from './components/BusForm';
import RestaurantForm from './components/RestaurantForm';
import AttractionForm from './components/AttractionForm';
import Users from './components/Users';
import Settings from './components/Settings';
import BusinessOverview from './components/BusinessOverview';
import NotFound from './pages/NotFound';

// Importing new pages
import FAQ from './pages/FAQ';
import Support from './pages/Support';
import UserProfile from './pages/UserProfile'; // Import UserProfile
import Confirmation from './pages/Confirmation.jsx'; // Import Confirmation

import './styles/App.css';
import { AuthContext } from './context/AuthContext'; // Import AuthContext

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isBusinessRoute = location.pathname.startsWith('/business');

  const { isAuthenticated, loading } = useContext(AuthContext); // Access AuthContext

  return (
    <div className="app">
      {/* Show Navbar only on non-admin and non-business routes */}
      {!isAdminRoute && !isBusinessRoute && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/stays" element={<Stays />} />
        <Route path="/flights" element={<Flights />} />
        <Route path="/car-rentals" element={<CarRentals />} />
        <Route path="/attractions" element={<Attractions />} />
        <Route path="/trains" element={<Trains />} />
        <Route path="/buses" element={<Buses />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* New Routes */}
        <Route path="/faq" element={<FAQ />} />
        <Route path="/support" element={<Support />} />

        {/* Protected User Profile Route */}
        <Route
          path="/profile"
          element={
            !loading ? (
              isAuthenticated ? (
                <UserProfile />
              ) : (
                <Navigate to="/login" replace />
              )
            ) : (
              <div className="user-profile">Loading...</div>
            )
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* Business Routes with Nested Routing */}
        <Route path="/business/*" element={<BusinessDashboard />}>
          {/* Default Route for Business Dashboard */}
          <Route index element={<BusinessOverview />} />
          {/* Specific Routes */}
          <Route path="dashboard" element={<BusinessOverview />} />
          <Route path="hotels" element={<HotelForm />} />
          <Route path="flights" element={<FlightForm />} />
          <Route path="car-rentals" element={<CarRentalForm />} />
          <Route path="trains" element={<TrainForm />} />
          <Route path="buses" element={<BusForm />} />
          <Route path="restaurants" element={<RestaurantForm />} />
          <Route path="attractions" element={<AttractionForm />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Redirect any unknown business routes to dashboard */}
        <Route path="/business/*" element={<Navigate to="/business/dashboard" />} />

        {/* General Routes */}
        <Route path="/destination/:destinationName" element={<Destination />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/search-flights" element={<FlightResults />} />
        <Route path="/search-stays" element={<StaysResults />} />
        <Route path="/search-car-rentals" element={<CarRentalsResults />} />
        <Route path="/search-attractions" element={<AttractionsResults />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gdpr" element={<GDPR />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Add the new /results route */}
        <Route path="/results" element={<FlightResults />} />

        {/* Add the /confirmation route */}
        <Route path="/confirmation" element={<Confirmation />} />

        {/* Fallback Route for Undefined Paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Show Footer only on non-admin and non-business routes */}
      {!isAdminRoute && !isBusinessRoute && <Footer />}
    </div>
  );
}

export default App;
