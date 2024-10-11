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
import Banner from '../components/Banner';
import TrendingSection from '../components/TrendingSection';
import '../styles/Restaurants.css';
import restaurantImage from '../assets/Restaurant1.jpg';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

// Categories specific to Restaurants
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
  // Add more categories as needed
];

const Restaurants = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  
  // Define state variables
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to New York City
  const [mapZoom, setMapZoom] = useState(12);
  const [markers, setMarkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // **Added:** Define selectedCategory state to manage the currently selected category
  const [selectedCategory, setSelectedCategory] = useState(null);

  const mapRef = useRef(null);

  // Environment variables (ensure these are set in your .env file)
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
      setFavorites(response.data.favorites);
    } catch (err) {
      console.error('Error fetching favorites:', err.response ? err.response.data : err.message);
      setError('Failed to fetch favorites.');
    }
  };

  // Add a favorite via backend
  const addFavoriteToDB = async (favoriteData) => {
    if (!isAuthenticated || !user) {
      alert('Please log in to add favorites.');
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
      alert('Favorite added successfully!');
    } catch (err) {
      console.error('Error adding favorite:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Failed to add favorite.');
      }
    }
  };

  // Remove a favorite via backend
  const removeFavoriteFromDB = async (favoriteId) => {
    if (!isAuthenticated || !user) {
      alert('Please log in to remove favorites.');
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
      alert('Favorite removed successfully!');
    } catch (err) {
      console.error('Error removing favorite:', err.response ? err.response.data : err.message);
      alert('Failed to remove favorite.');
    }
  };

  // Handle category selection
  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name); // **Ensure setSelectedCategory is defined**
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
      keyword: type, // Using keyword to filter by category
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
        setMapCenter({ lat: 40.7128, lng: -74.0060 }); // Reset to NYC
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
    return restaurantImage; // Fallback image if no photo reference
  };

  // Fetch detailed place information
  const fetchPlaceDetails = (placeId) => {
    if (!window.google || !mapRef.current) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.getDetails(
      {
        placeId: placeId,
        fields: ['name', 'rating', 'price_level', 'formatted_address', 'photos', 'reviews', 'website', 'url', 'geometry'],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
          setSelected(place);
        } else {
          setError('Failed to fetch place details.');
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

  useEffect(() => {
    if (isLoaded && markers.length > 0) {
      const newMarkers = markers.map((marker) => {
        if (marker.geometry && marker.geometry.location) {
          return addAdvancedMarker(
            {
              lat: marker.geometry.location.lat(),
              lng: marker.geometry.location.lng(),
            },
            marker
          );
        } else {
          console.warn(`Marker with ID ${marker.place_id} is missing geometry/location.`);
          return null;
        }
      }).filter(marker => marker !== null);

      // Cleanup markers on unmount or markers change
      return () => {
        newMarkers.forEach((marker) => marker.setMap(null));
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, markers]);

  // Fetch favorites when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]); // Clear favorites if not authenticated
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  if (loadError) return <div className="restaurants-error">Error loading maps</div>;
  if (!isLoaded || authLoading) return <div className="restaurants-loading">Loading Maps...</div>;

  return (
    <div className="restaurants-page">
      {/* Banner Section */}
      <Banner
        title="Find Your Favorite Restaurant"
        subtitle="Discover and book restaurants with ease"
        buttonText="Explore Restaurants"
        imageUrl={restaurantImage}
      />

      {/* Categories Section */}
      <div className="restaurants-categories-section">
        <h2>Explore by Cuisine</h2>
        <div className="restaurants-categories-grid">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`restaurants-category-item ${selectedCategory === category.name ? 'selected' : ''}`}
              onClick={() => handleCategoryClick(category)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter') handleCategoryClick(category); }}
            >
              <div className="restaurants-category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="restaurants-map-search-section">
        <div className="restaurants-map-search-bar">
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
          <button onClick={() => {
            const query = document.getElementById('search-input').value.trim();
            if (query) {
              setIsLoading(true);
              searchRestaurantsByQuery(query);
            }
          }} aria-label="Search" className="restaurants-search-button">
            Search
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="restaurants-map-section">
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
              <div className="restaurants-info-window">
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
                    className="restaurants-info-window-image"
                    loading="lazy"
                  />
                ) : (
                  <img
                    src={restaurantImage}
                    alt="No available"
                    className="restaurants-info-window-image"
                    loading="lazy"
                  />
                )}
                {selected.reviews && selected.reviews.length > 0 && (
                  <div className="restaurants-reviews">
                    <h4>User Reviews</h4>
                    {selected.reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="restaurants-review">
                        <p><strong>{review.author_name}</strong></p>
                        <p>{review.text}</p>
                        <p>Rating: {review.rating} ⭐</p>
                      </div>
                    ))}
                  </div>
                )}
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noopener noreferrer" className="restaurants-website-link">
                    Visit Website
                  </a>
                )}
                {selected.url && (
                  <a href={selected.url} target="_blank" rel="noopener noreferrer" className="restaurants-google-maps-link">
                    View on Google Maps
                  </a>
                )}
                <div className="restaurants-info-buttons">
                  <button
                    onClick={() => {
                      const favoriteData = {
                        type: 'restaurant',
                        placeId: selected.place_id,
                        name: selected.name,
                        address: selected.formatted_address || '',
                        rating: selected.rating || null,
                        priceLevel: selected.price_level || null,
                        photoReference: selected.photos && selected.photos.length > 0 ? selected.photos[0].photo_reference : null
                      };
                      addFavoriteToDB(favoriteData);
                    }}
                    className="restaurants-favorite-button"
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
      <div className="restaurants-dynamic-restaurants">
        <h2>{selectedCategory ? `${selectedCategory} Restaurants` : 'Restaurants'}</h2>
        {isLoading && <div className="restaurants-spinner">Loading restaurants...</div>}
        {error && <div className="restaurants-error-message">{error}</div>}
        <div className="restaurants-grid">
          {markers.length > 0 ? (
            markers.map((restaurant) => (
              <div key={restaurant.place_id} className="restaurants-item">
                <button
                  onClick={() => fetchPlaceDetails(restaurant.place_id)}
                  className="restaurants-image-button"
                  aria-label={`View details for ${restaurant.name}`}
                >
                  {restaurant.photos && restaurant.photos.length > 0 ? (
                    <img
                      src={getPhotoUrl(restaurant.photos[0].photo_reference)}
                      alt={restaurant.name}
                      className="restaurants-placeholder"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src={restaurantImage}
                      alt="No available"
                      className="restaurants-placeholder"
                      loading="lazy"
                    />
                  )}
                </button>
                <div className="restaurants-info">
                  <h3>{restaurant.name}</h3>
                  {restaurant.rating && <p>Rating: {restaurant.rating} ⭐</p>}
                  {restaurant.price_level !== undefined && (
                    <p>Price Level: {'$'.repeat(restaurant.price_level)}</p>
                  )}
                  <div className="restaurants-actions">
                    <button
                      onClick={() => fetchPlaceDetails(restaurant.place_id)}
                      className="restaurants-view-details-button"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        const favoriteData = {
                          type: 'restaurant',
                          placeId: restaurant.place_id,
                          name: restaurant.name,
                          address: restaurant.vicinity || restaurant.formatted_address || '',
                          rating: restaurant.rating || null,
                          priceLevel: restaurant.price_level || null,
                          photoReference: restaurant.photos && restaurant.photos.length > 0 ? restaurant.photos[0].photo_reference : null
                        };
                        addFavoriteToDB(favoriteData);
                      }}
                      className="restaurants-favorite-button"
                    >
                      Add to Favorites
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            !isLoading && <p>No restaurants to display.</p>
          )}
        </div>
      </div>

      {/* Favorites Section */}
      <div className="restaurants-favorites-section">
        <h2>Your Favorite Restaurants</h2>
        {favorites.length > 0 ? (
          <div className="restaurants-favorites-grid">
            {favorites.map((fav) => (
              <div key={fav.id} className="restaurants-favorite-item">
                <button
                  onClick={() => fetchPlaceDetails(fav.placeId)}
                  className="restaurants-favorite-image-button"
                  aria-label={`View details for ${fav.name}`}
                >
                  {fav.photoReference ? (
                    <img
                      src={getPhotoUrl(fav.photoReference)}
                      alt={fav.name}
                      className="restaurants-placeholder"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src={restaurantImage}
                      alt="No available"
                      className="restaurants-placeholder"
                      loading="lazy"
                    />
                  )}
                </button>
                <div className="restaurants-info">
                  <h3>{fav.name}</h3>
                  {fav.rating && <p>Rating: {fav.rating} ⭐</p>}
                  {fav.priceLevel !== undefined && (
                    <p>Price Level: {'$'.repeat(fav.priceLevel)}</p>
                  )}
                  <div className="restaurants-favorite-actions">
                    <button
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${fav.placeId}`;
                        window.open(mapsUrl, '_blank');
                      }}
                      className="restaurants-google-maps-button"
                    >
                      View in Google Maps
                    </button>
                    <button
                      onClick={() => removeFavoriteFromDB(fav.id)}
                      className="restaurants-delete-favorite-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You have no favorite restaurants yet.</p>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
