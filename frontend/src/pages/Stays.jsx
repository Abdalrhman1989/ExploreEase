// src/pages/Stays.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  GoogleMap,
  useLoadScript,
  MarkerClusterer,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import axios from 'axios';
import '../styles/Stays.css'; // Ensure you have appropriate CSS
import stayPlaceholder from '../assets/hotel.jpg'; // Placeholder image

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

// Categories specific to stays
const stayCategories = [
  { name: 'Hotels', type: 'lodging', icon: '🏨' },
  { name: 'Apartments', type: 'apartment', icon: '🏢' },
  { name: 'Resorts', type: 'resort', icon: '🏖️' },
  { name: 'Hostels', type: 'hostel', icon: '🏘️' },
  // Add more categories as needed
];

const Stays = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Paris center
  const [mapZoom, setMapZoom] = useState(12);
  const [places, setPlaces] = useState([]); // Renamed from markers to places for clarity
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Define getCategoryIcon function
  const getCategoryIcon = (type) => {
    const category = stayCategories.find((cat) => cat.type === type);
    if (category) {
      // Replace emoji with actual icon URLs if desired
      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30">
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24">${category.icon}</text>
        </svg>`
      )}`;
    }
    // Default marker icon
    return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  };

  // Fetch favorites from backend
  const fetchFavorites = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await axios.get('http://localhost:3001/api/favorites', {
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

  // Add favorite to backend
  const addFavoriteToDB = async (favoriteData) => {
    if (!isAuthenticated || !user) {
      alert('Please log in to add favorites.');
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await axios.post(
        'http://localhost:3001/api/favorites',
        favoriteData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
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

  // Remove favorite from backend
  const removeFavoriteFromDB = async (favoriteId) => {
    if (!isAuthenticated || !user) {
      alert('Please log in to remove favorites.');
      return;
    }

    try {
      const idToken = await user.getIdToken();
      await axios.delete(`http://localhost:3001/api/favorites/${favoriteId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== favoriteId));
      alert('Favorite removed successfully!');
    } catch (err) {
      console.error('Error removing favorite:', err.response ? err.response.data : err.message);
      alert('Failed to remove favorite.');
    }
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setError(null);
    setIsLoading(true);
    setPlaces([]);
    setSelected(null);
    searchStaysByType(category.type);
  };

  // Search stays by type
  const searchStaysByType = (type) => {
    if (!window.google) {
      setError('Google Maps is not loaded properly.');
      setIsLoading(false);
      return;
    }

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: mapCenter,
      radius: '10000',
      type: [type],
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setPlaces(results);
        setIsLoading(false);
      } else {
        setError('No places found for the selected category.');
        setPlaces([]);
        setIsLoading(false);
      }
    });
  };

  // Search stays by query
  const searchStaysByQuery = (query) => {
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
          type: ['lodging'],
          keyword: query,
        };

        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setPlaces(results);
            setIsLoading(false);
          } else {
            setError('No places found for the specified search.');
            setPlaces([]);
            setIsLoading(false);
          }
        });
      } else {
        setError('Location not found. Please try a different search.');
        setMapCenter({ lat: 48.8566, lng: 2.3522 });
        setMapZoom(12);
        setPlaces([]);
        setIsLoading(false);
      }
    });
  };

  // Get photo URL
  const getPhotoUrl = (photoReference) => {
    if (photoReference) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
    }
    return stayPlaceholder; // Fallback image
  };

  // Fetch place details
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

  useEffect(() => {
    if (isLoaded && places.length > 0) {
      // Markers are rendered via Marker components in JSX
    }

    // No cleanup needed as Marker components are managed by React
  }, [isLoaded, places]);

  // Fetch favorites when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]); // Clear favorites if not authenticated
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  if (loadError) return <div className="stays-error">Error loading maps</div>;
  if (!isLoaded || authLoading) return <div className="stays-loading">Loading Maps...</div>;

  return (
    <div className="stays">
      {/* Banner Section */}
      <div className="stays-banner" style={{ backgroundImage: `url(${stayPlaceholder})` }}>
        <div className="stays-banner-overlay">
          <div className="stays-banner-content">
            <h1>Find Your Perfect Stay</h1>
            <p>Browse thousands of hotels, apartments, resorts, and more</p>
            <button
              onClick={() => document.getElementById('search-bar').scrollIntoView({ behavior: 'smooth' })}
              className="stays-banner-button"
            >
              Explore Stays
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="stays-search-bar" id="search-bar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const query = e.target.elements.search.value.trim();
            if (query) {
              setIsLoading(true);
              searchStaysByQuery(query);
            } else {
              alert('Please enter a search term.');
            }
          }}
          className="stays-search-form"
        >
          <input
            type="text"
            name="search"
            placeholder="Search for a city or place to stay..."
            className="stays-search-input"
            aria-label="Search for a city or place to stay"
          />
          <button type="submit" className="stays-search-button">Search</button>
        </form>
      </div>

      {/* Categories Section */}
      <div className="stays-categories">
        <h2>Explore by Category</h2>
        <div className="stays-categories-grid">
          {stayCategories.map((category) => (
            <div
              key={category.type}
              className="stays-category-item"
              onClick={() => handleCategoryClick(category)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter') handleCategoryClick(category); }}
              aria-label={`Explore ${category.name}`}
            >
              <div className="stays-category-icon">{category.icon}</div>
              <h3 className="stays-category-name">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Map Section */}
      <div className="stays-map-section">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={mapZoom}
          center={mapCenter}
          options={options}
          onLoad={onMapLoad}
        >
          <MarkerClusterer>
            {(clusterer) =>
              places.map((place) => (
                <Marker
                  key={place.place_id}
                  position={{
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                  }}
                  clusterer={clusterer}
                  onClick={() => {
                    fetchPlaceDetails(place.place_id);
                    setMapCenter({
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng(),
                    });
                    setMapZoom(15);
                  }}
                  icon={{
                    url: getCategoryIcon(place.types[0]),
                    scaledSize: new window.google.maps.Size(30, 30),
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
              <div className="stays-info-window">
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
                    className="stays-info-window-image"
                    loading="lazy"
                  />
                ) : (
                  <img
                    src={stayPlaceholder}
                    alt="No available"
                    className="stays-info-window-image"
                    loading="lazy"
                  />
                )}
                {selected.reviews && selected.reviews.length > 0 && (
                  <div className="stays-reviews">
                    <h4>User Reviews</h4>
                    {selected.reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="stays-review">
                        <p><strong>{review.author_name}</strong></p>
                        <p>{review.text}</p>
                        <p>Rating: {review.rating} ⭐</p>
                      </div>
                    ))}
                  </div>
                )}
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noopener noreferrer" className="stays-website-link">
                    Visit Website
                  </a>
                )}
                {selected.url && (
                  <a href={selected.url} target="_blank" rel="noopener noreferrer" className="stays-google-maps-link">
                    View on Google Maps
                  </a>
                )}
                <div className="stays-info-buttons">
                  <button
                    onClick={() => {
                      const favoriteData = {
                        type: 'lodging',
                        placeId: selected.place_id,
                        name: selected.name,
                        address: selected.formatted_address || '',
                        rating: selected.rating || null,
                        priceLevel: selected.price_level || null,
                        photoReference: selected.photos && selected.photos.length > 0 ? selected.photos[0].photo_reference : null
                      };
                      addFavoriteToDB(favoriteData);
                    }}
                    className="stays-favorite-button"
                  >
                    Add to Favorites
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Dynamic Stays Section */}
      <div className="stays-dynamic-stays">
        <h2>{selectedCategory ? `${selectedCategory} Stays` : 'Available Stays'}</h2>
        {isLoading && <div className="stays-spinner">Loading stays...</div>}
        {error && <div className="stays-error-message">{error}</div>}
        <div className="stays-grid">
          {places.length > 0 ? (
            places.map((stay) => (
              <div key={stay.place_id} className="stays-item">
                <button
                  onClick={() => fetchPlaceDetails(stay.place_id)}
                  className="stays-image-button"
                  aria-label={`View details for ${stay.name}`}
                >
                  {stay.photos && stay.photos.length > 0 ? (
                    <img
                      src={getPhotoUrl(stay.photos[0].photo_reference)}
                      alt={stay.name}
                      className="stays-placeholder"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src={stayPlaceholder}
                      alt="No available"
                      className="stays-placeholder"
                      loading="lazy"
                    />
                  )}
                </button>
                <div className="stays-info">
                  <h3>{stay.name}</h3>
                  {stay.rating && <p>Rating: {stay.rating} ⭐</p>}
                  {stay.price_level !== undefined && (
                    <p>Price Level: {'$'.repeat(stay.price_level)}</p>
                  )}
                  <div className="stays-actions">
                    <button
                      onClick={() => fetchPlaceDetails(stay.place_id)}
                      className="stays-view-details-button"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        const favoriteData = {
                          type: 'lodging',
                          placeId: stay.place_id,
                          name: stay.name,
                          address: stay.vicinity || stay.formatted_address || '',
                          rating: stay.rating || null,
                          priceLevel: stay.price_level || null,
                          photoReference: stay.photos && stay.photos.length > 0 ? stay.photos[0].photo_reference : null
                        };
                        addFavoriteToDB(favoriteData);
                      }}
                      className="stays-favorite-button"
                    >
                      Add to Favorites
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            !isLoading && <p>No stays to display.</p>
          )}
        </div>
      </div>

      {/* Favorites Section */}
      <div className="stays-favorites-section">
        <h2>Your Favorites</h2>
        {favorites.length > 0 ? (
          <div className="stays-favorites-grid">
            {favorites.map((fav) => (
              <div key={fav.id} className="stays-favorite-item">
                <button
                  onClick={() => fetchPlaceDetails(fav.placeId)}
                  className="stays-favorite-image-button"
                  aria-label={`View details for ${fav.name}`}
                >
                  {fav.photoReference ? (
                    <img
                      src={getPhotoUrl(fav.photoReference)}
                      alt={fav.name}
                      className="stays-placeholder"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src={stayPlaceholder}
                      alt="No available"
                      className="stays-placeholder"
                      loading="lazy"
                    />
                  )}
                </button>
                <div className="stays-info">
                  <h3>{fav.name}</h3>
                  {fav.rating && <p>Rating: {fav.rating} ⭐</p>}
                  {fav.priceLevel !== undefined && (
                    <p>Price Level: {'$'.repeat(fav.priceLevel)}</p>
                  )}
                  <div className="stays-favorite-actions">
                    <button
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${fav.placeId}`;
                        window.open(mapsUrl, '_blank');
                      }}
                      className="stays-google-maps-button"
                    >
                      View in Google Maps
                    </button>
                    <button
                      onClick={() => removeFavoriteFromDB(fav.id)}
                      className="stays-delete-favorite-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You have no favorite stays yet.</p>
        )}
      </div>
    </div>
  );
};

export default Stays;
