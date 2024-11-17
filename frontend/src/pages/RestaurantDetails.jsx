// src/pages/RestaurantDetails.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/RestaurantDetails.css';
import { toast } from 'react-toastify';

const RestaurantDetails = () => {
  const { id } = useParams(); // Get the restaurant ID from the URL
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const GOOGLE_PLACES_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        // Example: Fetch restaurant details from your backend
        const response = await axios.get(`${BACKEND_URL}/api/restaurants/${id}`);
        setRestaurant(response.data.restaurant);
      } catch (err) {
        console.error('Error fetching restaurant details:', err);
        setError('Failed to load restaurant details.');
        toast.error('Failed to load restaurant details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id, BACKEND_URL]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!restaurant) return <div>No restaurant found.</div>;

  return (
    <div className="restaurant-details">
      <h1>{restaurant.name}</h1>
      {/* Display other restaurant details as needed */}
      <img
        src={
          restaurant.photoReference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant.photoReference}&key=${GOOGLE_PLACES_API_KEY}`
            : 'https://via.placeholder.com/400x300?text=No+Image'
        }
        alt={restaurant.name}
        loading="lazy"
      />
      <p>{restaurant.description}</p>
      {/* Add more details such as address, rating, reviews, etc. */}
    </div>
  );
};

export default RestaurantDetails;
