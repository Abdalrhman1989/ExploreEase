// src/pages/CarRentals.jsx

import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  GoogleMap,
  useLoadScript,
  MarkerClusterer,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCar } from 'react-icons/fa';

// Import MUI components
import {
  Card,
  Grid,
  Container,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import {
  FavoriteBorder,
  Delete,
  Search as SearchIcon,
} from '@mui/icons-material';

import '../styles/CarRentals.css';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

// Define categories specific to Car Rentals
const categories = [
  { name: 'Car Rental Companies', type: 'car_rental', icon: <FaCar size={24} /> },
];

const CarRentals = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [mapCenter, setMapCenter] = useState(null); // Initialize with null
  const [mapZoom, setMapZoom] = useState(12);
  const [markers, setMarkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Access environment variables directly
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  if (!BACKEND_URL) {
    console.error('REACT_APP_BACKEND_URL is not defined in the environment variables.');
  }

  // Load Google Maps Script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef(null);
  const mapSectionRef = useRef(null);
  const searchBarRef = useRef(null);

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Function to fetch favorites from backend
  const fetchFavorites = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setFavorites(response.data.favorites);
    } catch (err) {
      console.error('Error fetching favorites:', err.response ? err.response.data : err.message);
      toast.error('Failed to fetch favorites.');
    }
  };

  // Function to add a favorite via backend
  const addFavoriteToDB = async (favoriteData) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to add favorites.');
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await axios.post(`${BACKEND_URL}/api/favorites`, favoriteData, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setFavorites((prevFavorites) => [...prevFavorites, response.data.favorite]);
      toast.success('Favorite added successfully!');
    } catch (err) {
      console.error('Error adding favorite:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data && err.response.data.errors) {
        err.response.data.errors.forEach((error) => {
          toast.error(`Error: ${error.msg}`);
        });
      } else if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else {
        toast.error('Failed to add favorite.');
      }
    }
  };

  // Function to remove a favorite via backend
  const removeFavoriteFromDB = async (favoriteId) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to remove favorites.');
      return;
    }

    try {
      const idToken = await user.getIdToken();
      await axios.delete(`${BACKEND_URL}/api/favorites/${favoriteId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== favoriteId));
      toast.success('Favorite removed successfully!');
    } catch (err) {
      console.error('Error removing favorite:', err.response ? err.response.data : err.message);
      toast.error('Failed to remove favorite.');
    }
  };

  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setError(null);
    setIsLoading(true);
    setMarkers([]);
    setSelected(null);
    searchCarRentalsByType(category.type);
    // Scroll to search bar and categories
    if (searchBarRef.current) {
      searchBarRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const searchCarRentalsByType = (type) => {
    if (!window.google) {
      setError('Google Maps is not loaded properly.');
      setIsLoading(false);
      return;
    }

    if (!mapCenter) {
      setError('Map center is not defined.');
      setIsLoading(false);
      return;
    }

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: mapCenter,
      radius: '10000', // 10 km radius
      type: type,
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setMarkers(results);
        setIsLoading(false);
      } else {
        setError('No car rental companies found for the selected category.');
        setMarkers([]);
        setIsLoading(false);
      }
    });
  };

  const searchCarRentalsByQuery = (query) => {
    if (!window.google) {
      setError('Google Maps is not loaded properly.');
      setIsLoading(false);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: query }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        const location = results[0].geometry.location;
        setMapCenter({ lat: location.lat(), lng: location.lng() });
        setMapZoom(12);
        setSelectedCategory(null);

        const service = new window.google.maps.places.PlacesService(mapRef.current);
        const request = {
          location: location,
          radius: '10000',
          type: ['car_rental'],
          keyword: query,
        };

        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setMarkers(results);
            setIsLoading(false);
          } else {
            setError('No car rental companies found for the specified search.');
            setMarkers([]);
            setIsLoading(false);
          }
        });
      } else {
        setError('Location not found. Please try a different search.');
        setMarkers([]);
        setIsLoading(false);
      }
    });
  };

  const getPhotoUrl = (photoReference) => {
    if (photoReference) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
    }
    return null; // Return null if no photo reference
  };

  // Fetch detailed place information
  const fetchPlaceDetails = (placeId) => {
    if (!window.google || !mapRef.current) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.getDetails(
      {
        placeId: placeId,
        fields: [
          'name',
          'rating',
          'formatted_address',
          'photos',
          'reviews',
          'website',
          'url',
          'geometry',
          'types',
          'formatted_phone_number',
          'opening_hours',
          'price_level',
          'user_ratings_total',
          'vicinity',
        ],
      },
      (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry &&
          place.geometry.location
        ) {
          setSelected(place);
          // Center the map on the selected place
          setMapCenter({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
          setMapZoom(15);

          // Scroll the map into view
          if (mapSectionRef.current) {
            mapSectionRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          setError('Failed to fetch place details.');
          toast.error('Failed to fetch place details.');
        }
      }
    );
  };

  // Fetch favorites when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setMapZoom(12);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setError('Unable to retrieve your location. Please allow location access or search manually.');
          setIsLoading(false);
        }
      );
    } else {
      console.error('Geolocation not supported');
      setError('Geolocation is not supported by your browser.');
    }
  
  }, []);

  return (
    <Box className="car-rentals-component">
      <ToastContainer />

      {/* Banner Section */}
      <div className="car-rentals-component-banner">
        <div className="car-rentals-component-banner-content">
          <h1>Discover Car Rental Companies</h1>
          <p>Find and explore car rental options near you</p>
          <button
            className="car-rentals-component-explore-button"
            onClick={() => {
              // Scroll to the search bar and Explore by Type section
              if (searchBarRef.current) {
                searchBarRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <FaCar /> Explore Now
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="car-rentals-component-categories-section">
        <h2>Explore by Type</h2>
        <div className="car-rentals-component-categories-grid">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`car-rentals-component-category-item ${
                selectedCategory === category.name ? 'selected' : ''
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              <div className="car-rentals-component-category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar Section */}
      <Container className="car-rentals-component-map-search-section" ref={searchBarRef}>
        <Paper
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            const query = e.target.elements.search.value.trim(); // Updated line
            if (query) {
              setIsLoading(true);
              searchCarRentalsByQuery(query);
            }
          }}
          className="car-rentals-component-journey-form"
        >
          <div className="car-rentals-component-form-group">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Search for a city or rental company..."
              className="car-rentals-component-search-input"
              required
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="car-rentals-component-search-journey-button"
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
        </Paper>
      </Container>

      {/* Error Message Section */}
      {error && (
        <Container className="car-rentals-component-error-section">
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Container>
      )}

      {/* Map Section */}
      <div className="car-rentals-component-map-section" ref={mapSectionRef}>
        {isLoaded && mapCenter ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={mapZoom}
            center={mapCenter}
            options={options}
            onLoad={onMapLoad}
          >
            {/* Marker Clusterer */}
            <MarkerClusterer>
              {(clusterer) =>
                markers.map((marker) => (
                  <Marker
                    key={marker.place_id}
                    position={{
                      lat: marker.geometry.location.lat(),
                      lng: marker.geometry.location.lng(),
                    }}
                    clusterer={clusterer}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/car.png',
                      scaledSize: new window.google.maps.Size(40, 40),
                    }}
                    onClick={() => {
                      fetchPlaceDetails(marker.place_id);
                    }}
                  />
                ))
              }
            </MarkerClusterer>

            {selected?.geometry?.location && (
              <InfoWindow
                position={{
                  lat: selected.geometry.location.lat(),
                  lng: selected.geometry.location.lng(),
                }}
                onCloseClick={() => setSelected(null)}
              >
                <div className="car-rentals-component-info-window">
                  <h3>{selected.name}</h3>
                  {selected.rating && <p>Rating: {selected.rating} ⭐</p>}
                  {selected.formatted_address && <p>{selected.formatted_address}</p>}
                  {selected.photos && selected.photos.length > 0 && (
                    <img
                      src={getPhotoUrl(selected.photos[0].photo_reference)}
                      alt={selected.name}
                      className="car-rentals-component-info-window-image"
                    />
                  )}
                  {selected.formatted_phone_number && (
                    <p>
                      <strong>Phone:</strong> {selected.formatted_phone_number}
                    </p>
                  )}
                  {selected.opening_hours && selected.opening_hours.weekday_text && (
                    <div>
                      <strong>Opening Hours:</strong>
                      <ul>
                        {selected.opening_hours.weekday_text.map((day, index) => (
                          <li key={index}>{day}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selected.reviews && selected.reviews.length > 0 && (
                    <div className="car-rentals-component-reviews">
                      <h4>User Reviews</h4>
                      {selected.reviews.slice(0, 3).map((review, index) => (
                        <div key={index} className="car-rentals-component-review">
                          <strong>{review.author_name}</strong>
                          <p>{review.text}</p>
                          <p>Rating: {review.rating} ⭐</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {selected.website && (
                    <Button
                      variant="contained"
                      color="primary"
                      className="car-rentals-component-website-link"
                      href={selected.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Website
                    </Button>
                  )}
                  {selected.url && (
                    <Button
                      variant="contained"
                      color="primary"
                      className="car-rentals-component-google-maps-link"
                      href={selected.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Google Maps
                    </Button>
                  )}
                  <div className="car-rentals-component-info-buttons">
                    <Button
                      variant="contained"
                      color="primary"
                      className="car-rentals-component-favorite-button"
                      startIcon={<FavoriteBorder />}
                      onClick={() => {
                        const favoriteData = {
                          type: 'car_rental',
                          placeId: selected.place_id,
                          name: selected.name,
                          address: selected.formatted_address || '',
                          rating: selected.rating || null,
                          photoReference:
                            selected.photos && selected.photos.length > 0
                              ? selected.photos[0].photo_reference
                              : null,
                        };
                        addFavoriteToDB(favoriteData);
                      }}
                    >
                      Add to Favorites
                    </Button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : isLoaded && !mapCenter ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="600px">
            <Typography variant="h6" color="textSecondary">
              {error
                ? 'Unable to display the map. ' + error
                : 'Loading your location...'}
            </Typography>
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="600px">
            {loadError ? (
              <Typography variant="h6" color="error">
                Error loading Google Maps.
              </Typography>
            ) : (
              <Typography variant="h6" color="textSecondary">
                Loading Map...
              </Typography>
            )}
          </Box>
        )}
      </div>

      {/* Car Rental Companies Section */}
      {markers.length > 0 && (
        <div className="car-rentals-component-dynamic-carrentals">
          <Container>
            <h2>Car Rental Companies</h2>
            {isLoading && (
              <div className="car-rentals-component-spinner">
                <CircularProgress />
                <p>Loading car rental companies...</p>
              </div>
            )}
            {error && <div className="car-rentals-component-error-message">{error}</div>}
            <Grid container spacing={4}>
              {markers.map((company) => (
                <Grid item xs={12} sm={6} md={4} key={company.place_id}>
                  <Card className="car-rentals-component-item">
                    <button
                      className="car-rentals-component-image-button"
                      onClick={() => fetchPlaceDetails(company.place_id)}
                    >
                      {company.photos && company.photos.length > 0 ? (
                        <img
                          src={getPhotoUrl(company.photos[0].photo_reference)}
                          alt={company.name}
                          className="car-rentals-component-placeholder"
                          loading="lazy"
                        />
                      ) : (
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          height="200px"
                          bgcolor="#f0f0f0"
                        >
                          <FaCar size={50} color="#ccc" />
                        </Box>
                      )}
                    </button>
                    <div className="car-rentals-component-info">
                      <h3>{company.name}</h3>
                      {company.rating && <p>Rating: {company.rating} ⭐</p>}
                      {company.vicinity && <p>{company.vicinity}</p>}
                    </div>
                    <div className="car-rentals-component-actions">
                      <Button
                        variant="contained"
                        color="primary"
                        className="car-rentals-component-view-details-button"
                        onClick={() => fetchPlaceDetails(company.place_id)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        className="car-rentals-component-favorite-button-small"
                        startIcon={<FavoriteBorder />}
                        onClick={() => {
                          const favoriteData = {
                            type: 'car_rental',
                            placeId: company.place_id,
                            name: company.name,
                            address: company.vicinity || company.formatted_address || '',
                            rating: company.rating || null,
                            photoReference:
                              company.photos && company.photos.length > 0
                                ? company.photos[0].photo_reference
                                : null,
                          };
                          addFavoriteToDB(favoriteData);
                        }}
                      >
                        Favorite
                      </Button>
                    </div>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </div>
      )}

      {/* Favorites Section */}
      <div className="car-rentals-component-favorites-section">
        <Container>
          <h2>Your Favorite Car Rental Companies</h2>
          {favorites.length > 0 ? (
            <Grid container spacing={4}>
              {favorites
                .filter((fav) => fav.type === 'car_rental') 
                .map((fav) => (
                  <Grid item xs={12} sm={6} md={4} key={fav.id}>
                    <Card className="car-rentals-component-favorite-item">
                      <button
                        className="car-rentals-component-favorite-image-button"
                        onClick={() => fetchPlaceDetails(fav.placeId)}
                      >
                        {fav.photoReference ? (
                          <img
                            src={getPhotoUrl(fav.photoReference)}
                            alt={fav.name}
                            className="car-rentals-component-favorite-placeholder"
                            loading="lazy"
                          />
                        ) : (
                          <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="200px"
                            bgcolor="#f0f0f0"
                          >
                            <FaCar size={50} color="#ccc" />
                          </Box>
                        )}
                      </button>
                      <div className="car-rentals-component-favorite-info">
                        <h3>{fav.name}</h3>
                        {fav.rating && <p>Rating: {fav.rating} ⭐</p>}
                        {fav.address && <p>{fav.address}</p>}
                      </div>
                      <div className="car-rentals-component-favorite-actions">
                        <Button
                          variant="contained"
                          color="primary"
                          className="car-rentals-component-google-maps-button"
                          onClick={() => {
                            const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${fav.placeId}`;
                            window.open(mapsUrl, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          View on Google Maps
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          className="car-rentals-component-delete-favorite-button"
                          startIcon={<Delete />}
                          onClick={() => removeFavoriteFromDB(fav.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          ) : (
            <p className="no-favorites-message">
              You have no favorite car rental companies yet.
            </p>
          )}
        </Container>
      </div>
    </Box>
  );
};

export default CarRentals;
