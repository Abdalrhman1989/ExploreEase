// frontend/src/App.jsx

import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context
import { AuthContext } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Stays from './pages/Stays';
import Flights from './pages/Flights';
import CarRentals from './pages/CarRentals';
import Attractions from './pages/Attractions';
import Trains from './pages/Trains';
import Buses from './pages/Buses';
import Restaurants from './pages/Restaurants';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import BusinessDashboard from './pages/Dashboard';
import Destination from './pages/Destination';
import Booking from './pages/Booking';
import FlightResults from './pages/FlightResults';
import About from './pages/About';
import Contact from './pages/Contact';
import GDPR from './pages/GDPR';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import FAQ from './pages/FAQ';
import Support from './pages/Support';
import UserProfile from './pages/UserProfile';
import Confirmation from './pages/Confirmation.jsx';
import HotelDetails from './pages/HotelDetails.jsx';
import HotelBook from './pages/HotelBook.jsx';
import ManageAttractions from './pages/ManageAttractions.jsx';
import ManageRestaurants from './pages/ManageRestaurants.jsx';
import ManageHotels from './pages/ManageHotels.jsx';
import PaymentPage from './pages/PaymentPage.jsx'; 
import RestaurantDetails from './pages/RestaurantDetails'; 


// New Pages
import Blog from './pages/Blog';
import Careers from './pages/Careers';

// Components
import Navbar from './components/NavBar.jsx';
import Footer from './components/Footer';
import HotelForm from './components/HotelForm';
import RestaurantForm from './components/RestaurantForm';
import AttractionForm from './components/AttractionForm';
import BusinessOverview from './components/BusinessOverview';
import AdminConfirmOffers from './components/AdminConfirmOffers';
import ApprovedHotels from './components/ApprovedHotels.jsx';
import AttractionDetails from './components/AttractionDetails';

// Styles
import './styles/App.css';

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
        <Route path="/attractions/:id" element={<AttractionDetails />} />
        <Route path="/trains" element={<Trains />} />
        <Route path="/buses" element={<Buses />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurants/:id" element={<RestaurantDetails />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/support" element={<Support />} />

        {/* New Public Routes */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/careers" element={<Careers />} />

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
          <Route path="hotels/add" element={<HotelForm />} /> 

          <Route path="restaurants" element={<RestaurantForm />} />
          <Route path="restaurants/add" element={<RestaurantForm />} /> 
          <Route path="attractions" element={<AttractionForm />} />
          <Route path="attractions/add" element={<AttractionForm />} />

          <Route path="manage-hotels" element={<ManageHotels />} />
          <Route path="manage-restaurants" element={<ManageRestaurants />} />
          <Route path="manage-attractions" element={<ManageAttractions />} />
        </Route>

        {/* General Routes */}
        <Route path="/destination/:destinationName" element={<Destination />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/search-flights" element={<FlightResults />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gdpr" element={<GDPR />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Featured Hotels and Hotel Details Routes */}
        <Route path="/featured-hotels" element={<ApprovedHotels />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />

        {/* Booking Route */}
        <Route path="/hotels/:id/book" element={<HotelBook />} />

        {/* Add the /results route */}
        <Route path="/results" element={<FlightResults />} />

        {/* Add the /payment route */}
        <Route path="/payment" element={<PaymentPage />} />

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
