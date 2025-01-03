// src/pages/Restaurants.jsx

import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  GoogleMap,
  useLoadScript,
  MarkerClusterer,
  InfoWindow,
} from '@react-google-maps/api';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Restaurants.css';
import {
  FaCalendarAlt,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RestaurantBanner from '../assets/Restaurant1.jpg';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

// Categories
const categories = [
  { name: 'Italian', type: 'italian_restaurant', icon: '🍝' },
  { name: 'Chinese', type: 'chinese_restaurant', icon: '🥡' },
  { name: 'Mexican', type: 'mexican_restaurant', icon: '🌮' },
  { name: 'Japanese', type: 'japanese_restaurant', icon: '🍣' },
  { name: 'Indian', type: 'indian_restaurant', icon: '🍛' },
  { name: 'Fast Food', type: 'fast_food_restaurant', icon: '🍔' },
  { name: 'Seafood', type: 'seafood_restaurant', icon: '🦞' },
  { name: 'Vegetarian', type: 'vegetarian_restaurant', icon: '🥗' },
  { name: 'Vegan', type: 'vegan_restaurant', icon: '🌱' },
  { name: 'Desserts', type: 'dessert_restaurant', icon: '🍰' },
];

const Restaurants = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  // Initialize map to null to handle asynchronous geolocation
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(2);
  const [markers, setMarkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [approvedRestaurants, setApprovedRestaurants] = useState([]);
  const [approvedLoading, setApprovedLoading] = useState(true);
  const [approvedError, setApprovedError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  const [currentCity, setCurrentCity] = useState('');

  const mapRef = useRef(null);
  const searchSectionRef = useRef(null);
  const mapSectionRef = useRef(null);

  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const GOOGLE_PLACES_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Function to get city name from coordinates using reverse geocoding
  const getCityFromCoordinates = async (lat, lng) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat, lng };
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const addressComponents = results[0].address_components;
          for (let component of addressComponents) {
            if (component.types.includes('locality')) {
              resolve(component.long_name);
              return;
            }
          }
          // Fallback to administrative_area_level_1 or country
          for (let component of addressComponents) {
            if (component.types.includes('administrative_area_level_1')) {
              resolve(component.long_name);
              return;
            }
          }
          resolve('');
        } else {
          reject('Geocoder failed due to: ' + status);
        }
      });
    });
  };

  // useEffect to determine current city whenever mapCenter changes
  useEffect(() => {
    if (isLoaded && window.google && mapCenter) {
      getCityFromCoordinates(mapCenter.lat, mapCenter.lng)
        .then((city) => {
          setCurrentCity(city);
        })
        .catch((err) => {
          console.error('Error getting city:', err);
          setCurrentCity('');
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapCenter, isLoaded]);

  // Fetch favorites from backend
  const fetchFavorites = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      // Filter favorites to include only restaurants
      const restaurantFavorites = response.data.favorites.filter(
        (fav) => fav.type === 'restaurant'
      );
      setFavorites(restaurantFavorites);
    } catch (err) {
      console.error(
        'Error fetching favorites:',
        err.response ? err.response.data : err.message
      );
      setError('Failed to fetch favorites.');
      toast.error('Failed to fetch favorites.');
    }
  };

  // Add a favorite via backend
  const addFavoriteToDB = async (favoriteData) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to add favorites.');
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await axios.post(
        `${BACKEND_URL}/api/favorites`,
        favoriteData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      // Update favorites state with the new favorite
      setFavorites((prevFavorites) => [...prevFavorites, response.data.favorite]);
      toast.success('Favorite added successfully!');
    } catch (err) {
      console.error(
        'Error adding favorite:',
        err.response ? err.response.data : err.message
      );
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else {
        toast.error('Failed to add favorite.');
      }
    }
  };

  // Remove a favorite via backend
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
      // Update favorites state by removing the deleted favorite
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== favoriteId));
      toast.success('Favorite removed successfully!');
    } catch (err) {
      console.error(
        'Error removing favorite:',
        err.response ? err.response.data : err.message
      );
      toast.error('Failed to remove favorite.');
    }
  };

  // Handle category selection
  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setError(null);
    setIsLoading(true);
    setMarkers([]);
    setSelected(null);
    searchRestaurantsByType(category.type);
  };

  // Search restaurants by type using Google Places API
  const searchRestaurantsByType = (type) => {
    if (!window.google) {
      setError('Google Maps is not loaded properly.');
      setIsLoading(false);
      return;
    }

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: mapCenter,
      radius: '10000',
      type: ['restaurant'],
      keyword: type,
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setMarkers(results);
        setIsLoading(false);
      } else {
        setError('No restaurants found for the selected category.');
        setMarkers([]);
        setIsLoading(false);
      }
    });
  };

  // Search restaurants by query (e.g., city or cuisine)
  const searchRestaurantsByQuery = (query) => {
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
          type: ['restaurant'],
          keyword: query,
        };

        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setMarkers(results);
            setIsLoading(false);
          } else {
            setError('No restaurants found for the specified search.');
            setMarkers([]);
            setIsLoading(false);
          }
        });
      } else {
        setError('Location not found. Please try a different search.');
        // Center map on Odense instead of world view
        setMapCenter({ lat: 55.4038, lng: 10.4024 }); // Odense coordinates
        setMapZoom(12);
        setMarkers([]);
        setIsLoading(false);
      }
    });
  };

  // Get photo URL from photo reference
  const getPhotoUrl = (photoReference) => {
    if (photoReference) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
    }
    return ''; // Return empty string if no photo reference
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
          'place_id', // Added 'place_id' to ensure it's included
          'rating',
          'price_level',
          'formatted_address',
          'photos',
          'reviews',
          'website',
          'url',
          'geometry',
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
          // Scroll to the map section
          if (mapSectionRef.current) {
            mapSectionRef.current.scrollIntoView({ behavior: 'smooth' });
          }
          // Adjust map center and zoom
          setMapCenter({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
          setMapZoom(15);
        } else {
          setError('Failed to fetch place details.');
          toast.error('Failed to fetch place details.');
        }
      }
    );
  };

  // Define addAdvancedMarker to add markers using google.maps.Marker
  const addAdvancedMarker = (position, place) => {
    if (!window.google || !mapRef.current) return;

    const marker = new window.google.maps.Marker({
      map: mapRef.current,
      position,
      title: place.name,
      icon: {
        url: getCategoryIcon(place.types[0]),
        scaledSize: new window.google.maps.Size(30, 30),
      },
    });

    marker.addListener('click', () => {
      fetchPlaceDetails(place.place_id);
      setMapCenter({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      setMapZoom(15);
    });

    // Cleanup marker on unmount
    return marker;
  };

  // Get category icon based on type
  const getCategoryIcon = (type) => {
    const category = categories.find((cat) => cat.type === type);
    if (category) {
      // Using emoji as marker icons
      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30">
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24">${category.icon}</text>
        </svg>`
      )}`;
    }
    // Default marker icon
    return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  };

  // Fetch approved restaurants from backend based on current city
  const fetchApprovedRestaurants = async (city) => {
    if (!city) {
      setApprovedRestaurants([]);
      setApprovedLoading(false);
      return;
    }

    setApprovedLoading(true);
    setApprovedError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/restaurants/approved`, {
        params: {
          location: city, // Pass the current city as a query parameter
          page: 1,
          limit: 100,
        },
      });
      console.log('Fetched Approved Restaurants:', response.data.restaurants);
      setApprovedRestaurants(response.data.restaurants);
    } catch (err) {
      console.error(
        'Error fetching approved restaurants:',
        err.response ? err.response.data : err.message
      );
      setApprovedError('Failed to fetch partner restaurants.');
      toast.error('Failed to fetch partner restaurants.');
    } finally {
      setApprovedLoading(false);
    }
  };

  // Handle restaurant selection for calendar
  const [selectedRestaurantForCalendar, setSelectedRestaurantForCalendar] = useState(
    null
  );

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurantForCalendar(restaurant);
  };

  const closeCalendar = () => {
    setSelectedRestaurantForCalendar(null);
  };

  const toggleExpand = (restaurantId) => {
    setExpandedRestaurantId(
      expandedRestaurantId === restaurantId ? null : restaurantId
    );
  };

  const [expandedRestaurantId, setExpandedRestaurantId] = useState(null);

  // Get photo URL from approved restaurant's image
  const getApprovedPhotoUrl = (imageUrl) => {
    if (imageUrl) {
      return imageUrl;
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  // Function to scroll to the search section
  const scrollToSearchSection = () => {
    if (searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setMapZoom(12);
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error fetching geolocation:', error);
          toast.error('Unable to retrieve your location. Showing Odense, Denmark.');
          // Center map on Odense instead of world view
          setMapCenter({ lat: 55.4038, lng: 10.4024 }); // Odense coordinates
          setMapZoom(12);
          setLocationLoading(false);
        }
      );
    } else {
      console.error('Geolocation not supported by this browser.');
      toast.error('Geolocation is not supported by your browser. Showing Odense, Denmark.');
      // Center map on Odense instead of world view
      setMapCenter({ lat: 55.4038, lng: 10.4024 }); // Odense coordinates
      setMapZoom(12);
      setLocationLoading(false);
    }
  }, []);

  // Fetch approved restaurants and favorites when authentication or city changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
    // Fetch approved restaurants based on the current city
    fetchApprovedRestaurants(currentCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, currentCity]);

  // Add markers to the map when markers state changes
  useEffect(() => {
    if (isLoaded && markers.length > 0 && mapRef.current) {
      const newMarkers = markers
        .map((marker) => {
          if (marker.geometry && marker.geometry.location) {
            return addAdvancedMarker(
              {
                lat: marker.geometry.location.lat(),
                lng: marker.geometry.location.lng(),
              },
              marker
            );
          } else {
            console.warn(
              `Marker with ID ${marker.place_id} is missing geometry/location.`
            );
            return null;
          }
        })
        .filter((marker) => marker !== null);

      // Cleanup markers on unmount or markers change
      return () => {
        newMarkers.forEach((marker) => marker.setMap(null));
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, markers]);

  if (loadError)
    return <div className="restaurants-error">Error loading maps</div>;
  if (!isLoaded || authLoading || locationLoading)
    return <div className="restaurants-loading">Loading Maps...</div>;

  return (
    <div className="restaurants-component">
      {/* Banner Section */}
      <div
        className="restaurants-component-banner"
        style={{
          backgroundImage: `url(${RestaurantBanner})`,
        }}
      >
        <div className="restaurants-component-banner-content">
          <h1>Find Your Favorite Restaurant</h1>
          <p>Discover and book restaurants with ease</p>
          <button
            className="restaurants-component-explore-button"
            onClick={scrollToSearchSection}
            aria-label="Explore Restaurants"
          >
            Explore Restaurants
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="restaurants-component-categories-section">
        <h2>Explore by Cuisine</h2>
        <div className="restaurants-component-categories-grid">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`restaurants-component-category-item ${
                selectedCategory === category.name ? 'selected' : ''
              }`}
              onClick={() => handleCategoryClick(category)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleCategoryClick(category);
              }}
            >
              <div className="restaurants-component-category-icon">
                {category.icon}
              </div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar Section */}
      <div
        className="restaurants-component-map-search-section"
        ref={searchSectionRef} // Attach the ref here
      >
        <div className="restaurants-component-map-search-bar">
          <input
            id="search-input"
            type="text"
            placeholder="Search for a city or cuisine..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsLoading(true);
                searchRestaurantsByQuery(e.target.value);
              }
            }}
            aria-label="Search for a city or cuisine"
          />
          <button
            onClick={() => {
              const query = document
                .getElementById('search-input')
                .value.trim();
              if (query) {
                setIsLoading(true);
                searchRestaurantsByQuery(query);
              }
            }}
            aria-label="Search"
            className="restaurants-component-search-button"
          >
            Search
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div
        className="restaurants-component-map-section"
        ref={mapSectionRef} // Attach the ref here
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={mapZoom}
          center={mapCenter}
          options={options}
          onLoad={onMapLoad}
        >
          <MarkerClusterer>
            {(clusterer) =>
              markers.map((marker) => (
                <div key={marker.place_id} />
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
              <div className="restaurants-component-info-window">
                <h3>{selected.name}</h3>
                {selected.rating && <p>Rating: {selected.rating} ⭐</p>}
                {selected.price_level !== undefined && (
                  <p>Price Level: {'$'.repeat(selected.price_level)}</p>
                )}
                {selected.formatted_address && <p>{selected.formatted_address}</p>}
                {selected.photos && selected.photos.length > 0 ? (
                  <img
                    src={getPhotoUrl(selected.photos[0].photo_reference)}
                    alt={selected.name}
                    className="restaurants-component-info-window-image"
                    loading="lazy"
                  />
                ) : (
                  <img
                    src="https://via.placeholder.com/300x200?text=No+Image"
                    alt="No available"
                    className="restaurants-component-info-window-image"
                    loading="lazy"
                  />
                )}
                {selected.reviews && selected.reviews.length > 0 && (
                  <div className="restaurants-component-reviews">
                    <h4>User Reviews</h4>
                    {selected.reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="restaurants-component-review">
                        <p>
                          <strong>{review.author_name}</strong>
                        </p>
                        <p>{review.text}</p>
                        <p>Rating: {review.rating} ⭐</p>
                      </div>
                    ))}
                  </div>
                )}
                {selected.website && (
                  <a
                    href={selected.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="restaurants-component-website-link"
                  >
                    Visit Website
                  </a>
                )}
                {selected.url && (
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="restaurants-component-google-maps-link"
                  >
                    View on Google Maps
                  </a>
                )}
                <div className="restaurants-component-info-buttons">
                  <button
                    onClick={() => {
                      const favoriteData = {
                        type: 'restaurant',
                        placeId: selected.place_id, // Ensure place_id is included
                        name: selected.name,
                        address: selected.formatted_address || '',
                        rating: selected.rating || null,
                        priceLevel: selected.price_level || null,
                        photoReference:
                          selected.photos && selected.photos.length > 0
                            ? selected.photos[0].photo_reference
                            : null,
                      };
                      addFavoriteToDB(favoriteData);
                    }}
                    className="restaurants-component-favorite-button"
                  >
                    Add to Favorites
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Dynamic Restaurants Section */}
      <div className="restaurants-component-dynamic-restaurants">
        <h2>
          {selectedCategory ? `${selectedCategory} Restaurants` : 'Restaurants'}
        </h2>
        {isLoading && (
          <div className="restaurants-component-spinner">Loading restaurants...</div>
        )}
        {error && (
          <div className="restaurants-component-error-message">{error}</div>
        )}
        <div className="restaurants-component-grid">
          {markers.length > 0 ? (
            markers.map((restaurant) => (
              <div key={restaurant.place_id} className="restaurants-component-item">
                <button
                  onClick={() => fetchPlaceDetails(restaurant.place_id)}
                  className="restaurants-component-image-button"
                  aria-label={`View details for ${restaurant.name}`}
                >
                  {restaurant.photos && restaurant.photos.length > 0 ? (
                    <img
                      src={getPhotoUrl(restaurant.photos[0].photo_reference)}
                      alt={restaurant.name}
                      className="restaurants-component-placeholder"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/300x200?text=No+Image"
                      alt="No available"
                      className="restaurants-component-placeholder"
                      loading="lazy"
                    />
                  )}
                </button>
                <div className="restaurants-component-info">
                  <h3>{restaurant.name}</h3>
                  {restaurant.rating && <p>Rating: {restaurant.rating} ⭐</p>}
                  {restaurant.price_level !== undefined && (
                    <p>Price Level: {'$'.repeat(restaurant.price_level)}</p>
                  )}
                  <div className="restaurants-component-actions">
                    <button
                      onClick={() => fetchPlaceDetails(restaurant.place_id)}
                      className="restaurants-component-view-details-button"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        const favoriteData = {
                          type: 'restaurant',
                          placeId: restaurant.place_id, // Ensure placeId is correctly mapped
                          name: restaurant.name,
                          address: restaurant.vicinity || restaurant.formatted_address || '',
                          rating: restaurant.rating || null,
                          priceLevel: restaurant.price_level || null,
                          photoReference:
                            restaurant.photos && restaurant.photos.length > 0
                              ? restaurant.photos[0].photo_reference
                              : null,
                        };
                        addFavoriteToDB(favoriteData);
                      }}
                      className="restaurants-component-favorite-button"
                    >
                      Add to Favorites
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            !isLoading && (
              <p className="restaurants-component-no-restaurants">
                No restaurants to display.
              </p>
            )
          )}
        </div>
      </div>

      {/* Our User Restaurants Section */}
      <div className="restaurants-component-approved-restaurants-section">
        <h2>Our User Restaurants in {currentCity || 'Your Area'}</h2>
        {approvedLoading ? (
          <div className="restaurants-component-spinner">
            <div className="spinner"></div>
            <p>Loading partner restaurants...</p>
          </div>
        ) : approvedError ? (
          <div className="restaurants-component-error-message">
            {approvedError}
          </div>
        ) : approvedRestaurants.length === 0 ? (
          <p className="restaurants-component-no-restaurants">
            No partner restaurants available in {currentCity || 'this area'}.
          </p>
        ) : (
          <div className="restaurants-component-approved-grid">
            {approvedRestaurants.map((restaurant) => (
              <div
                key={restaurant.RestaurantID}
                className="restaurants-component-approved-item"
              >
                <div className="restaurants-component-approved-image">
                  <img
                    src={getApprovedPhotoUrl(
                      restaurant.images && restaurant.images.length > 0
                        ? restaurant.images[0]
                        : ''
                    )}
                    alt={restaurant.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                </div>
                <div className="restaurants-component-approved-details">
                  <h3>
                    <FaInfoCircle /> {restaurant.name}
                  </h3>
                  <p>
                    <FaInfoCircle /> <strong>Location:</strong>{' '}
                    {restaurant.location}
                  </p>
                  <p>
                    <FaInfoCircle /> <strong>Cuisine:</strong>{' '}
                    {restaurant.cuisine}
                  </p>
                  <p>
                    <FaInfoCircle /> <strong>Price Range:</strong>{' '}
                    {'$'.repeat(restaurant.priceRange)}
                  </p>
                  <p>
                    <FaInfoCircle /> <strong>Rating:</strong> {restaurant.rating}{' '}
                    ⭐
                  </p>
                  {expandedRestaurantId === restaurant.RestaurantID && (
                    <>
                      <p>
                        <FaInfoCircle /> <strong>Description:</strong>{' '}
                        {restaurant.description}
                      </p>
                      {/* Amenities */}
                      {restaurant.amenities &&
                        restaurant.amenities.length > 0 && (
                          <div className="restaurants-component-approved-amenities">
                            <h4>Amenities:</h4>
                            <ul>
                              {restaurant.amenities.map((amenity, index) => (
                                <li key={index}>{amenity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </>
                  )}
                  <button
                    className="restaurants-component-approved-expand-button"
                    onClick={() => toggleExpand(restaurant.RestaurantID)}
                    aria-expanded={
                      expandedRestaurantId === restaurant.RestaurantID
                    }
                    aria-controls={`restaurant-details-${restaurant.RestaurantID}`}
                  >
                    {expandedRestaurantId === restaurant.RestaurantID ? (
                      <>
                        See Less <FaChevronUp />
                      </>
                    ) : (
                      <>
                        See More <FaChevronDown />
                      </>
                    )}
                  </button>
                  {/* Additional Actions */}
                  <div className="restaurants-component-approved-actions">
                    <Link
                      to={`/restaurants/${restaurant.RestaurantID}`}
                      className="restaurants-component-approved-view-details-button"
                      onClick={() => fetchPlaceDetails(restaurant.placeId)} // Ensure this triggers the scroll and InfoWindow
                    >
                      <FaInfoCircle /> View Details
                    </Link>
                    <button
                      onClick={() => handleRestaurantSelect(restaurant)}
                      className="restaurants-component-approved-view-calendar-button"
                      aria-label={`View availability for ${restaurant.name}`}
                    >
                      <FaCalendarAlt /> View Availability
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Availability Calendar Modal */}
        {selectedRestaurantForCalendar && (
          <div
            className={`restaurants-component-availability-modal-overlay show`}
            onClick={closeCalendar}
          >
            <div
              className="restaurants-component-availability-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <MdClose
                className="restaurants-component-close-button"
                onClick={closeCalendar}
                aria-label="Close calendar"
              />
              <h3>Availability for {selectedRestaurantForCalendar.name}</h3>
              <div className="restaurants-component-calendar-container">
                <Calendar
                  tileClassName={({ date, view }) => {
                    if (view === 'month') {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const isAvailable = selectedRestaurantForCalendar.availability
                        ? selectedRestaurantForCalendar.availability[dateStr]
                        : null;
                      if (isAvailable === true) {
                        return 'available-date';
                      } else if (isAvailable === false) {
                        return 'unavailable-date';
                      }
                    }
                    return null;
                  }}
                />
              </div>
              {/* Legend */}
              <div className="restaurants-component-calendar-legend">
                <span className="available-dot"></span> Available
                <span className="unavailable-dot"></span> Unavailable
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Favorites Section */}
      <div className="restaurants-component-favorites-section">
        <h2>Your Favorite Restaurants</h2>
        {favorites.length > 0 ? (
          <div className="restaurants-component-favorites-grid">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="restaurants-component-favorite-item"
              >
                <button
                  onClick={() => fetchPlaceDetails(fav.placeId)}
                  className="restaurants-component-favorite-image-button"
                  aria-label={`View details for ${fav.name}`}
                >
                  {fav.photoReference ? (
                    <img
                      src={getPhotoUrl(fav.photoReference)}
                      alt={fav.name}
                      className="restaurants-component-placeholder"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/300x200?text=No+Image"
                      alt="No available"
                      className="restaurants-component-placeholder"
                      loading="lazy"
                    />
                  )}
                </button>
                <div className="restaurants-component-favorite-info">
                  <h3>{fav.name}</h3>
                  {fav.rating && <p>Rating: {fav.rating} ⭐</p>}
                  {fav.priceLevel !== undefined && (
                    <p>Price Level: {'$'.repeat(fav.priceLevel)}</p>
                  )}
                  <div className="restaurants-component-favorite-actions">
                    <button
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${fav.placeId}`;
                        window.open(mapsUrl, '_blank');
                      }}
                      className="restaurants-component-favorite-google-maps-button"
                    >
                      View in Google Maps
                    </button>
                    <button
                      onClick={() => removeFavoriteFromDB(fav.id)}
                      className="restaurants-component-favorite-delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="restaurants-component-no-favorites">
            You have no favorite restaurants yet.
          </p>
        )}
      </div>

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
        theme="light"
      />
    </div>
  );
};

export default Restaurants;
