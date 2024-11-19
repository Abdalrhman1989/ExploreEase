import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  MarkerClusterer,
  InfoWindow,
} from '@react-google-maps/api';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce'; 
import '../styles/Attractions.css';
import '../styles/ApprovedAttractions.css';
import hotelPlaceholder from '../assets/hotel1.jpg'; 

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

// Mapping from Google Place types to backend types
const typeMapping = {
  lodging: 'hotel',
  hotel: 'hotel',
  apartment: 'apartment',
  resort: 'resort',
  hostel: 'hostel',
  // Add more mappings as needed
};

// Categories specific to attractions
const categories = [
  { name: 'Adventure', type: 'park', icon: '🚵' },
  { name: 'Cultural', type: 'museum', icon: '🏛️' },
  { name: 'Nature', type: 'natural_feature', icon: '🌳' },
  { name: 'Historical', type: 'tourist_attraction', icon: '🏰' },
  { name: 'Shopping', type: 'shopping_mall', icon: '🛍️' },
  { name: 'Nightlife', type: 'night_club', icon: '🎉' },
  { name: 'Education', type: 'university', icon: '🎓' },
  { name: 'Entertainment', type: 'movie_theater', icon: '🎬' },
  { name: 'Sports', type: 'stadium', icon: '🏟️' },
  { name: 'Religious', type: 'hindu_temple', icon: '🕌' },
  { name: 'Government', type: 'city_hall', icon: '🏢' },
];

const Attractions = () => {
  // Context and Navigation
  const { user, isAuthenticated, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // State Variables
  const [mapCenter, setMapCenter] = useState({ lat: 55.4038, lng: 10.4024 });
  const [mapZoom, setMapZoom] = useState(12);
  const [googleMarkers, setGoogleMarkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [createdAttractions, setCreatedAttractions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); 

  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  // References
  const mapRef = useRef(null);
  const mapSectionRef = useRef(null);

  // Load Google Maps Script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Handlers and Utilities

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Fetch Favorites (Memoized)
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      console.log('Fetched Favorites:', response.data.favorites);
      setFavorites(response.data.favorites);
    } catch (err) {
      console.error('Error fetching favorites:', err.response ? err.response.data : err.message);
      setError('Failed to fetch favorites.');
    }
  }, [isAuthenticated, user, BACKEND_URL]);

  // Fetch Created Attractions (Memoized)
  const fetchCreatedAttractions = useCallback(async (city) => {
    if (!city) {
      setCreatedAttractions([]);
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/attractions/approved`, {
        params: { city },
      });
      console.log('Fetched Created Attractions:', response.data.attractions);
      setCreatedAttractions(response.data.attractions);
    } catch (err) {
      console.error('Error fetching created attractions:', err.response ? err.response.data : err.message);
      setError('Failed to fetch created attractions.');
      setCreatedAttractions([]);
    }
  }, [BACKEND_URL]);

  // Add Favorite to DB
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
      console.log('Added Favorite:', response.data.favorite);
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

  // Remove Favorite from DB
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
      console.log(`Removed Favorite ID: ${favoriteId}`);
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== favoriteId));
      alert('Favorite removed successfully!');
    } catch (err) {
      console.error('Error removing favorite:', err.response ? err.response.data : err.message);
      alert('Failed to remove favorite.');
    }
  };

  // Determine if Attraction is User-Created
  const isUserCreatedAttraction = (attraction) => {
    // Assuming user-created attractions have an 'id' but no 'place_id'
    return attraction.id && !attraction.place_id;
  };

  // Handle Category Click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setError(null);
    setIsLoading(true);
    setGoogleMarkers([]);
    setSelected(null);
    setHasSearched(true);
    searchAttractionsByType(category.type);
  };

  // Search Attractions by Type
  const searchAttractionsByType = (type) => {
    if (!window.google) {
      setError('Google Maps is not loaded properly.');
      setIsLoading(false);
      return;
    }

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: mapCenter,
      radius: '10000',
      type: type,
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setGoogleMarkers(results);
        setIsLoading(false);
      } else {
        setError('No places found for the selected category.');
        setGoogleMarkers([]);
        setIsLoading(false);
      }
    });
  };

  // Debounced Search Attractions by Query
  const debouncedSearchAttractionsByQuery = useCallback(
    debounce((query) => {
      if (!window.google) {
        setError('Google Maps is not loaded properly.');
        setIsLoading(false);
        return;
      }

      setHasSearched(true);

      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address: query }, (results, status) => {
        if (status === 'OK' && results.length > 0) {
          const location = results[0].geometry.location;
          setMapCenter({ lat: location.lat(), lng: location.lng() });
          setMapZoom(12);
          setSelectedCategory(null);
          const city = extractCityFromGeocodeResults(results[0]);
          setSelectedCity(city);
          fetchCreatedAttractions(city);

          const service = new window.google.maps.places.PlacesService(mapRef.current);
          const request = {
            location: location,
            radius: '10000',
            type: ['tourist_attraction', 'lodging'],
            keyword: query,
          };

          service.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              setGoogleMarkers(results);
              setIsLoading(false);
            } else {
              setError('No places found for the specified search.');
              setGoogleMarkers([]);
              setIsLoading(false);
            }
          });
        } else {
          setError('Location not found. Please try a different search.');
          setMapCenter({ lat: 55.4038, lng: 10.4024 });
          setMapZoom(12);
          setGoogleMarkers([]);
          setSelectedCity(null);
          setCreatedAttractions([]);
          setIsLoading(false);
        }
      });
    }, 500), // 500ms debounce
    [fetchCreatedAttractions, mapCenter]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearchAttractionsByQuery.cancel();
    };
  }, [debouncedSearchAttractionsByQuery]);

  // Extract City from Geocode Results
  const extractCityFromGeocodeResults = (geocodeResult) => {
    if (!geocodeResult || !geocodeResult.address_components) return null;
    const addressComponents = geocodeResult.address_components;
    const cityComponent = addressComponents.find((component) =>
      component.types.includes('locality')
    ) || addressComponents.find((component) =>
      component.types.includes('administrative_area_level_2')
    );
    return cityComponent ? cityComponent.long_name : null;
  };

  // Get City from Location (Reverse Geocoding)
  const getCityFromLocation = async (location) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location });
      if (response.status === 'OK' && response.results.length > 0) {
        return extractCityFromGeocodeResults(response.results[0]);
      }
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  };

  // Get Photo URL
  const getPhotoUrl = (photoReference) => {
    if (photoReference) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
    }
    return null;
  };

  // Fetch Place Details
  const fetchPlaceDetails = (placeId) => {
    if (!window.google || !mapRef.current) return;

    // Corrected fields parameter by removing 'description'
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.getDetails(
      {
        placeId: placeId,
        fields: ['name', 'rating', 'price_level', 'formatted_address', 'photos', 'reviews', 'website', 'url', 'geometry', 'opening_hours', 'types'],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
          const selectedPlace = {
            name: place.name,
            formatted_address: place.formatted_address,
            rating: place.rating,
            price_level: place.price_level,
            opening_hours: place.opening_hours,
            types: place.types,
            amenities: place.types, // Assuming 'types' can act as amenities
            photos: place.photos,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          };
          console.log('Selected Place:', selectedPlace);
          setSelected(selectedPlace);
          setMapCenter({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
          setMapZoom(15);
        } else {
          setError('Failed to fetch place details.');
        }
      }
    );
  };

  // Handle View Details Based on Source
  const handleViewDetails = (attraction, source = 'map') => {
    if (source === 'map') {
      if (isUserCreatedAttraction(attraction)) {
        // Directly set selected if it's a user-created attraction
        const selectedAttraction = {
          id: attraction.id || attraction.AttractionID,
          name: attraction.name,
          formatted_address: attraction.formatted_address || attraction.location || '',
          rating: attraction.rating,
          entryFee: attraction.entryFee || attraction.price_level || null,
          description: attraction.description,
          amenities: attraction.amenities,
          images: attraction.images || attraction.photos || [],
          latitude: attraction.latitude,
          longitude: attraction.longitude,
        };

        // Validate coordinates
        if (
          typeof selectedAttraction.latitude === 'number' &&
          typeof selectedAttraction.longitude === 'number' &&
          isFinite(selectedAttraction.latitude) &&
          isFinite(selectedAttraction.longitude)
        ) {
          console.log('Selected Attraction:', selectedAttraction);
          setSelected(selectedAttraction);
          setMapCenter({
            lat: selectedAttraction.latitude,
            lng: selectedAttraction.longitude,
          });
          setMapZoom(15);
        } else {
          setError('Invalid coordinates for the selected attraction.');
          return;
        }
      } else if (attraction.place_id) {
        // Fetch details for Google Place
        fetchPlaceDetails(attraction.place_id);
      } else {
        setError('Invalid attraction data.');
      }

      if (mapSectionRef.current) {
        mapSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (source === 'approved') {
      const id = attraction.AttractionID || attraction.id;
      navigate(`/attractions/${id}`); // Navigate to the details page
    }
  };

  // Debugging: Log Selected State
  useEffect(() => {
    if (selected) {
      console.log('Selected state updated:', selected);
    }
  }, [selected]);

  // Fetch Favorites on Authentication Change
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, user, fetchFavorites]);

  // Get Category Icon
  const getCategoryIconSVG = (type) => {
    const category = categories.find((cat) => cat.type === type);
    if (category) {
      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30">
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24">${category.icon}</text>
        </svg>`
      )}`;
    }
    return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  };

  // Get Created Attraction Icon
  const getCreatedAttractionIcon = () => {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30">
        <polygon points="15,1 19,11 29,11 21,17 24,27 15,21 6,27 9,17 1,11 11,11" 
                 fill="#FFD700" stroke="#DAA520" stroke-width="2"/>
      </svg>`
    )}`;
  };

  return (
    <div className="attractions-component">
      {/* Conditional Rendering for Load Error */}
      {loadError && (
        <div className="attractions-component-error">Error loading maps</div>
      )}

      {/* Conditional Rendering for Loading States */}
      {!isLoaded || authLoading ? (
        <div className="attractions-component-loading">Loading Maps...</div>
      ) : (
        <>
          {/* Banner Section */}
          <div className="attractions-component-banner">
            <div className="attractions-component-banner-content">
              <h1>Discover Attractions</h1>
              <p>Explore the world's best attractions</p>
              <button
                onClick={() => document.getElementById('search-input').focus()}
                className="attractions-component-explore-button"
                aria-label="Explore Now"
              >
                Explore Now
              </button>
            </div>
          </div>

          {/* Categories Section */}
          <div className="attractions-component-categories-section">
            <h2>Explore by Category</h2>
            <div className="attractions-component-categories-grid">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`attractions-component-category-item ${
                    selectedCategory === category.name ? 'selected' : ''
                  }`}
                  onClick={() => handleCategoryClick(category)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleCategoryClick(category);
                  }}
                  aria-label={`Explore ${category.name}`}
                >
                  <div className="attractions-component-category-icon">
                    {category.icon}
                  </div>
                  <h3>{category.name}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar Section */}
          <div className="attractions-component-map-search-section">
            <div className="attractions-component-map-search-bar">
              <input
                id="search-input"
                type="text"
                placeholder="Search for a city or attraction..."
                onChange={(e) => {
                  const query = e.target.value.trim();
                  if (query) {
                    setIsLoading(true);
                    debouncedSearchAttractionsByQuery(query);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); 
                    const query = e.target.value.trim();
                    if (query) {
                      setIsLoading(true);
                      debouncedSearchAttractionsByQuery(query);
                    }
                  }
                }}
                aria-label="Search for a city or attraction"
              />
              <button
                onClick={() => {
                  const query = document.getElementById('search-input').value.trim();
                  if (query) {
                    setIsLoading(true);
                    debouncedSearchAttractionsByQuery(query);
                  }
                }}
                aria-label="Search"
                className="attractions-component-search-button"
              >
                Search
              </button>
            </div>
          </div>

          {/* Map Section */}
          <div className="attractions-component-map-section" ref={mapSectionRef}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={mapZoom}
              center={mapCenter}
              options={options}
              onLoad={onMapLoad}
            >
              <MarkerClusterer>
                {(clusterer) =>
                  googleMarkers.map((marker) => (
                    <Marker
                      key={marker.place_id}
                      position={{
                        lat: marker.geometry.location.lat(),
                        lng: marker.geometry.location.lng(),
                      }}
                      clusterer={clusterer}
                      onClick={() => handleViewDetails(marker, 'map')}
                      icon={{
                        url: getCategoryIconSVG(marker.types[0]),
                        scaledSize: new window.google.maps.Size(30, 30),
                      }}
                      aria-label={`Marker for ${marker.name}`}
                    />
                  ))
                }
              </MarkerClusterer>

              {/* Created Attractions Markers */}
              {createdAttractions.map((attraction) => (
                <Marker
                  key={attraction.AttractionID}
                  position={{ lat: attraction.latitude, lng: attraction.longitude }}
                  onClick={() => handleViewDetails(attraction, 'map')}
                  icon={{
                    url: getCreatedAttractionIcon(),
                    scaledSize: new window.google.maps.Size(30, 30),
                  }}
                  aria-label={`Marker for ${attraction.name}`}
                />
              ))}

              {/* InfoWindow */}
              {selected && selected.latitude && selected.longitude && (
                <InfoWindow
                  position={{
                    lat: selected.latitude,
                    lng: selected.longitude,
                  }}
                  onCloseClick={() => setSelected(null)}
                >
                  <div className="attractions-component-info-window">
                    <h3>{selected.name}</h3>

                    {/* Rating */}
                    {selected.rating !== undefined && <p>Rating: {selected.rating} ⭐</p>}

                    {/* Entry Fee */}
                    {selected.entryFee !== undefined && (
                      <p>Entry Fee: ${selected.entryFee}</p>
                    )}

                    {/* Price Level */}
                    {selected.price_level !== undefined && (
                      <p>Price Level: {'$'.repeat(selected.price_level)}</p>
                    )}

                    {/* Address/Location */}
                    <p>{selected.formatted_address || selected.location || 'No location available'}</p>

                    {/* Opening Hours */}
                    {selected.opening_hours && (
                      <p>Opening Hours: {selected.opening_hours.weekday_text.join(', ')}</p>
                    )}

                    {/* Description */}
                    {selected.description && (
                      <p>Description: {selected.description}</p>
                    )}

                    {/* Amenities */}
                    {selected.amenities && selected.amenities.length > 0 && (
                      <div>
                        <strong>Amenities:</strong>
                        <ul>
                          {selected.amenities.map((amenity, index) => (
                            <li key={index}>{amenity}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Photos */}
                    {selected.photos && selected.photos.length > 0 ? (
                      <div className="attractions-component-info-window-images">
                        <img
                          src={getPhotoUrl(selected.photos[0].photo_reference)}
                          alt={`${selected.name} - 1`}
                          className="attractions-component-info-window-image"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = hotelPlaceholder;
                          }}
                        />
                      </div>
                    ) : selected.images && selected.images.length > 0 ? (
                      <div className="attractions-component-info-window-images">
                        <img
                          src={selected.images[0]} // Assuming images are URLs
                          alt={`${selected.name} - 1`}
                          className="attractions-component-info-window-image"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = hotelPlaceholder;
                          }}
                        />
                      </div>
                    ) : null}

                    {/* Reviews */}
                    {selected.reviews && selected.reviews.length > 0 && (
                      <div className="attractions-component-reviews">
                        <h4>User Reviews</h4>
                        {selected.reviews.slice(0, 3).map((review, index) => (
                          <div key={index} className="attractions-component-review">
                            <p><strong>{review.author_name}</strong></p>
                            <p>{review.text}</p>
                            <p>Rating: {review.rating} ⭐</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    {selected.website && (
                      <a href={selected.website} target="_blank" rel="noopener noreferrer" className="attractions-component-google-maps-link">
                        Visit Website
                      </a>
                    )}
                    {selected.url && (
                      <a href={selected.url} target="_blank" rel="noopener noreferrer" className="attractions-component-google-maps-link">
                        View on Google Maps
                      </a>
                    )}

                    {/* Add to Favorites Button */}
                    <div className="attractions-component-info-buttons">
                      <button
                        onClick={() => {
                          const favoriteData = {
                            type: 'attraction',
                            placeId: selected.place_id || `user-${selected.id}`, 
                            name: selected.name,
                            address: selected.formatted_address || selected.location || '',
                            rating: selected.rating || null,
                            entryFee: selected.entryFee || selected.price_level || null,
                            // Include photoReference based on available data
                            photoReference: selected.photos && selected.photos.length > 0
                              ? selected.photos[0].photo_reference
                              : selected.images && selected.images.length > 0
                              ? selected.images[0]
                              : null,
                            // Include latitude and longitude for map positioning
                            latitude: selected.latitude,
                            longitude: selected.longitude,
                          };
                          addFavoriteToDB(favoriteData);
                        }}
                        className="attractions-component-favorite-button"
                        aria-label="Add to Favorites"
                      >
                        Add to Favorites
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>

          {/* Dynamic Attractions Section */}
          <div className="attractions-component-dynamic-attractions">
            <h2>{selectedCategory ? `${selectedCategory} Attractions` : 'Attractions'}</h2>
            {isLoading && <div className="attractions-component-spinner">Loading attractions...</div>}
            {error && <div className="attractions-component-error-message">{error}</div>}
            <div className="attractions-component-grid">
              {googleMarkers.length > 0 ? (
                googleMarkers.map((attraction) => (
                  <div key={attraction.place_id} className="attractions-component-item">
                    <button
                      onClick={() => handleViewDetails(attraction, 'map')} 
                      className="attractions-component-image-button"
                      aria-label={`View details for ${attraction.name}`}
                    >
                      {attraction.photos && attraction.photos.length > 0 ? (
                        <img
                          src={getPhotoUrl(attraction.photos[0].photo_reference)}
                          alt={attraction.name}
                          className="attractions-component-placeholder"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = hotelPlaceholder;
                          }}
                        />
                      ) : (
                        <div className="attractions-component-placeholder no-image">
                          <p>No image available.</p>
                        </div>
                      )}
                    </button>
                    <div className="attractions-component-info">
                      <h3>{attraction.name}</h3>
                      {attraction.rating !== undefined && <p>Rating: {attraction.rating} ⭐</p>}
                      {attraction.entryFee !== undefined && (
                        <p>Entry Fee: ${attraction.entryFee}</p>
                      )}
                      <p>{attraction.formatted_address || attraction.vicinity || 'No address available'}</p>
                      <div className="attractions-component-actions">
                        <button
                          onClick={() => handleViewDetails(attraction, 'map')} 
                          className="attractions-component-favorite-button"
                          aria-label={`View details for ${attraction.name}`}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            const favoriteData = {
                              type: 'attraction',
                              placeId: attraction.place_id,
                              name: attraction.name,
                              address: attraction.vicinity || attraction.formatted_address || '',
                              rating: attraction.rating || null,
                              entryFee: attraction.entryFee || null,
                              photoReference: attraction.photos && attraction.photos.length > 0
                                ? attraction.photos[0].photo_reference
                                : null,
                              // Include latitude and longitude for map positioning
                              latitude: attraction.geometry.location.lat(),
                              longitude: attraction.geometry.location.lng(),
                            };
                            addFavoriteToDB(favoriteData);
                          }}
                          className="attractions-component-favorite-button"
                          aria-label={`Add ${attraction.name} to Favorites`}
                        >
                          Add to Favorites
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                hasSearched && !isLoading && <p className="attractions-component-no-attractions">No attractions to display.</p>
              )}
            </div>
          </div>

          {/* Approved Attractions Section */}
          {createdAttractions.length > 0 && (
            <div className="approved-attractions-container">
              <h2>Our Partner Attractions in {selectedCity}</h2>
              <div className="approved-attractions-grid">
                {createdAttractions.map((attraction) => (
                  <div key={attraction.AttractionID} className="approved-attractions-card">
                    <div className="approved-attractions-image">
                      {attraction.images && attraction.images.length > 0 ? (
                        <img
                          src={attraction.images[0]}
                          alt={attraction.name}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = hotelPlaceholder;
                          }}
                        />
                      ) : (
                        <div className="approved-attractions-image no-image">
                          <p>No image available.</p>
                        </div>
                      )}
                    </div>
                    <div className="approved-attractions-details">
                      <h3>{attraction.name}</h3>
                      {attraction.entryFee !== undefined && (
                        <p>Entry Fee: ${attraction.entryFee}</p>
                      )}
                      <p>{attraction.location || 'No location available'}</p>
                      <div className="approved-attractions-actions">
                        <button
                          onClick={() => handleViewDetails(attraction, 'approved')} 
                          className="approved-attractions-view-details-button"
                          aria-label={`View details for ${attraction.name}`}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            const favoriteData = {
                              type: 'attraction',
                              placeId: attraction.AttractionID, 
                              name: attraction.name,
                              address: `${attraction.location}`,
                              rating: attraction.rating || null,
                              entryFee: attraction.entryFee || null,
                              photoReference: attraction.images && attraction.images.length > 0
                                ? attraction.images[0]
                                : null,
                              latitude: attraction.latitude,
                              longitude: attraction.longitude,
                            };
                            addFavoriteToDB(favoriteData);
                          }}
                          className="approved-attractions-add-favorite-button"
                          aria-label={`Add ${attraction.name} to Favorites`}
                        >
                          Add to Favorites
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorites Section */}
          <div className="attractions-component-favorites-section">
            <h2>Your Favorite Attractions</h2>
            {favorites.filter(fav => fav.type === 'attraction').length > 0 ? (
              <div className="attractions-component-favorites-grid">
                {favorites.filter(fav => fav.type === 'attraction').map((fav) => (
                  <div key={fav.id || fav.AttractionID} className="attractions-component-favorite-item">
                    <button
                      onClick={() => handleViewDetails(fav, 'map')} 
                      className="attractions-component-favorite-image-button"
                      aria-label={`View details for ${fav.name}`}
                    >
                      {fav.photoReference ? (
                        <img
                          src={getPhotoUrl(fav.photoReference)}
                          alt={fav.name}
                          className="attractions-component-placeholder"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = hotelPlaceholder;
                          }}
                        />
                      ) : (
                        <div className="attractions-component-placeholder no-image">
                          <p>No image available.</p>
                        </div>
                      )}
                    </button>
                    <div className="attractions-component-favorite-info">
                      <h3>{fav.name}</h3>
                      {fav.entryFee !== undefined && (
                        <p>Entry Fee: ${fav.entryFee}</p>
                      )}
                      <div className="attractions-component-favorite-actions">
                        {/* "View in Google Maps" Button */}
                        <button
                          onClick={() => {
                            let mapsUrl = '';
                            if (fav.placeId && !fav.placeId.startsWith('user-')) {
                              mapsUrl = `https://www.google.com/maps/place/?q=place_id:${fav.placeId}`;
                            } else if (fav.latitude && fav.longitude) {
                              mapsUrl = `https://www.google.com/maps/@${fav.latitude},${fav.longitude},15z`;
                            }
                            if (mapsUrl) {
                              window.open(mapsUrl, '_blank');
                            } else {
                              alert('Unable to determine location for this attraction.');
                            }
                          }}
                          className="attractions-component-favorite-button"
                          aria-label={`View ${fav.name} in Google Maps`}
                        >
                          View in Google Maps
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeFavoriteFromDB(fav.id || fav.AttractionID)}
                          className="attractions-component-favorite-button"
                          aria-label={`Delete ${fav.name} from Favorites`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="attractions-component-no-favorites">
                You have no favorite attractions yet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Attractions;
