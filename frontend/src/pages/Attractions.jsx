// frontend/src/pages/Attractions.jsx

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
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/Attractions.css';
import '../styles/ApprovedAttractions.css'; // Import ApprovedAttractions.css if needed

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const Attractions = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate(); // Initialize useNavigate
  const [mapCenter, setMapCenter] = useState({ lat: 55.4038, lng: 10.4024 });
  const [mapZoom, setMapZoom] = useState(12);
  const [googleMarkers, setGoogleMarkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [createdAttractions, setCreatedAttractions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapSectionRef = useRef(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

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

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await axios.get('http://localhost:3001/api/favorites', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      console.log('Fetched Favorites:', response.data.favorites); // Debugging Line
      setFavorites(response.data.favorites);
    } catch (err) {
      console.error('Error fetching favorites:', err.response ? err.response.data : err.message);
      setError('Failed to fetch favorites.');
    }
  }, [isAuthenticated, user]);

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
      console.log('Added Favorite:', response.data.favorite); // Debugging Line
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
      console.log(`Removed Favorite ID: ${favoriteId}`); // Debugging Line
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.AttractionID !== favoriteId));
      alert('Favorite removed successfully!');
    } catch (err) {
      console.error('Error removing favorite:', err.response ? err.response.data : err.message);
      alert('Failed to remove favorite.');
    }
  };

  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setError(null);
    setIsLoading(true);
    setGoogleMarkers([]);
    setSelected(null);
    setHasSearched(true);
    searchAttractionsByType(category.type);
  };

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

  const searchAttractionsByQuery = (query) => {
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
  };

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

  const getPhotoUrl = (photoReference) => {
    if (photoReference) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
    }
    return null;
  };

  const fetchPlaceDetails = (placeId) => {
    if (!window.google || !mapRef.current) return;

    if (!isNaN(placeId)) {
      const attraction = createdAttractions.find(attr => attr.AttractionID === parseInt(placeId));
      if (attraction) {
        setSelected({
          id: attraction.AttractionID,
          name: attraction.name,
          formatted_address: attraction.location,
          rating: attraction.rating,
          entryFee: attraction.entryFee,
          description: attraction.description,
          amenities: attraction.amenities,
          images: attraction.images.map((img) => ({
            photo_reference: img,
          })),
          latitude: attraction.latitude,
          longitude: attraction.longitude,
        });
        setMapCenter({
          lat: attraction.latitude,
          lng: attraction.longitude,
        });
        setMapZoom(15);
      }
    } else {
      const service = new window.google.maps.places.PlacesService(mapRef.current);
      service.getDetails(
        {
          placeId: placeId,
          fields: ['name', 'rating', 'price_level', 'formatted_address', 'photos', 'reviews', 'website', 'url', 'geometry', 'opening_hours', 'description', 'amenities'],
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
            setSelected(place);
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
    }
  };

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

  const fetchCreatedAttractions = async (city) => {
    if (!city) {
      setCreatedAttractions([]);
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/api/attractions/approved', {
        params: { city },
      });
      console.log('Fetched Created Attractions:', response.data.attractions); // Debugging Line
      setCreatedAttractions(response.data.attractions);
    } catch (err) {
      console.error('Error fetching created attractions:', err.response ? err.response.data : err.message);
      setError('Failed to fetch created attractions.');
      setCreatedAttractions([]);
    }
  };

  useEffect(() => {
    if (selectedCity) {
      fetchCreatedAttractions(selectedCity);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!selectedCity && isLoaded) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const currentLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setMapCenter(currentLocation);
            setMapZoom(12);

            const city = await getCityFromLocation(currentLocation);
            if (city) {
              setSelectedCity(city);
              fetchCreatedAttractions(city);
            }
          },
          () => {
            // Handle location access denial if needed
            console.warn('Geolocation permission denied.');
          }
        );
      }
    }
  }, [isLoaded]);

  const getCategoryIcon = (type) => {
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

  const getCreatedAttractionIcon = () => {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30">
        <polygon points="15,1 19,11 29,11 21,17 24,27 15,21 6,27 9,17 1,11 11,11" 
                 fill="#FFD700" stroke="#DAA520" stroke-width="2"/>
      </svg>`
    )}`;
  };

  if (loadError)
    return <div className="attractions-component-error">Error loading maps</div>;
  if (!isLoaded || authLoading)
    return <div className="attractions-component-loading">Loading Maps...</div>;

  const handleViewDetails = (attraction) => {
    const id = attraction.AttractionID || attraction.place_id;
    navigate(`/attractions/${id}`); // Navigate to the details page
  };

  return (
    <div className="attractions-component">
      {/* Banner Section */}
      <div className="attractions-component-banner">
        <div className="attractions-component-banner-content">
          <h1>Discover Attractions</h1>
          <p>Explore the world's best attractions</p>
          <button onClick={() => document.getElementById('search-input').focus()} className="attractions-component-explore-button">
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
              className={`attractions-component-category-item ${selectedCategory === category.name ? 'selected' : ''}`}
              onClick={() => handleCategoryClick(category)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter') handleCategoryClick(category); }}
            >
              <div className="attractions-component-category-icon">{category.icon}</div>
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsLoading(true);
                searchAttractionsByQuery(e.target.value);
              }
            }}
            aria-label="Search for a city or attraction"
          />
          <button onClick={() => {
            const query = document.getElementById('search-input').value.trim();
            if (query) {
              setIsLoading(true);
              searchAttractionsByQuery(query);
            }
          }} aria-label="Search" className="attractions-component-search-button">
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
                  onClick={() => fetchPlaceDetails(marker.place_id)}
                  icon={{
                    url: getCategoryIcon(marker.types[0]),
                    scaledSize: new window.google.maps.Size(30, 30),
                  }}
                />
              ))
            }
          </MarkerClusterer>

          {/* Created Attractions Markers */}
          {createdAttractions.map((attraction) => (
            <Marker
              key={attraction.AttractionID}
              position={{ lat: attraction.latitude, lng: attraction.longitude }}
              onClick={() => fetchPlaceDetails(attraction.AttractionID)}
              icon={{
                url: getCreatedAttractionIcon(),
                scaledSize: new window.google.maps.Size(30, 30),
              }}
            />
          ))}

          {/* InfoWindow */}
          {selected && (
            <InfoWindow
              position={{
                lat: selected.geometry?.location?.lat() || selected.latitude,
                lng: selected.geometry?.location?.lng() || selected.longitude,
              }}
              onCloseClick={() => setSelected(null)}
            >
              <div className="attractions-component-info-window">
                <h3>{selected.name}</h3>

                {/* Conditional Rendering for Rating */}
                {selected.rating !== undefined && <p>Rating: {selected.rating} ⭐</p>}

                {/* Conditional Rendering for Entry Fee */}
                {selected.entryFee !== undefined && (
                  <p>Entry Fee: ${selected.entryFee}</p>
                )}

                {/* Conditional Rendering for Price Level */}
                {selected.price_level !== undefined && (
                  <p>Price Level: {'$'.repeat(selected.price_level)}</p>
                )}

                {/* Address/Location */}
                <p>{selected.formatted_address || selected.location || 'No location available'}</p>

                {/* Conditional Rendering for Opening Hours */}
                {selected.opening_hours && (
                  <p>Opening Hours: {selected.opening_hours.weekday_text.join(', ')}</p>
                )}

                {/* Conditional Rendering for Description */}
                {selected.description && (
                  <p>Description: {selected.description}</p>
                )}

                {/* Conditional Rendering for Amenities */}
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

                {/* Conditional Rendering for Photos */}
                {selected.photos && selected.photos.length > 0 ? (
                  <div className="attractions-component-info-window-images">
                    <img
                      src={getPhotoUrl(selected.photos[0].photo_reference)}
                      alt={`${selected.name} - 1`}
                      className="attractions-component-info-window-image"
                      loading="lazy"
                    />
                  </div>
                ) : selected.images && selected.images.length > 0 ? (
                  <div className="attractions-component-info-window-images">
                    <img
                      src={selected.images[0]}
                      alt={`${selected.name} - 1`}
                      className="attractions-component-info-window-image"
                      loading="lazy"
                    />
                  </div>
                ) : null}

                {/* Conditional Rendering for Reviews */}
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

                {/* Conditional Rendering for Links */}
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
                        placeId: selected.place_id || selected.AttractionID,
                        name: selected.name,
                        address: selected.formatted_address || selected.location || '',
                        rating: selected.rating || null,
                        entryFee: selected.entryFee || selected.price_level || null, // Adjust based on type
                        ...(selected.photos && selected.photos.length > 0
                          ? { photoReference: selected.photos[0].photo_reference }
                          : selected.images && selected.images.length > 0
                          ? { photoReference: selected.images[0] }
                          : {})
                      };
                      addFavoriteToDB(favoriteData);
                    }}
                    className="attractions-component-favorite-button"
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
                  onClick={() => handleViewDetails(attraction)} // Navigate to details
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
                        e.target.src = 'https://via.placeholder.com/400?text=No+Image';
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
                      onClick={() => handleViewDetails(attraction)} // Navigate to details
                      className="attractions-component-favorite-button"
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
                          entryFee: attraction.entryFee || null, // Adjust as needed
                          photoReference: attraction.photos && attraction.photos.length > 0
                            ? attraction.photos[0].photo_reference
                            : null,
                        };
                        addFavoriteToDB(favoriteData);
                      }}
                      className="attractions-component-favorite-button"
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

      {/* Created Attractions Section */}
      {createdAttractions.length > 0 && (
        <div className="approved-attractions-container"> {/* Updated Class Name */}
          <h2>Our Partner Attractions in {selectedCity}</h2>
          <div className="approved-attractions-grid"> {/* Updated Class Name */}
            {createdAttractions.map((attraction) => (
              <div key={attraction.AttractionID} className="approved-attractions-card"> {/* Updated Class Name */}
                <div className="approved-attractions-image">
                  {attraction.images && attraction.images.length > 0 ? (
                    <img
                      src={attraction.images[0]}
                      alt={attraction.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="approved-attractions-image no-image">
                      <p>No image available.</p>
                    </div>
                  )}
                </div>
                <div className="approved-attractions-details"> {/* Updated Class Name */}
                  <h3>{attraction.name}</h3>
                  {attraction.entryFee !== undefined && (
                    <p>Entry Fee: ${attraction.entryFee}</p>
                  )}
                  <p>{attraction.location || 'No location available'}</p>
                  <div className="approved-attractions-actions"> {/* Updated Class Name */}
                    <button
                      onClick={() => handleViewDetails(attraction)}
                      className="approved-attractions-view-details-button"
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
                          rating: attraction.rating || null, // If applicable
                          entryFee: attraction.entryFee || null, // Use entryFee
                          photoReference: attraction.images && attraction.images.length > 0
                            ? attraction.images[0]
                            : null,
                        };
                        addFavoriteToDB(favoriteData);
                      }}
                      className="approved-attractions-add-favorite-button"
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
              <div key={fav.AttractionID} className="attractions-component-favorite-item">
                <button
                  onClick={() => handleViewDetails(fav)}
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
                        e.target.src = 'https://via.placeholder.com/400?text=No+Image';
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
                    <button
                      onClick={() => handleViewDetails(fav)}
                      className="attractions-component-favorite-button"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => removeFavoriteFromDB(fav.AttractionID)}
                      className="attractions-component-favorite-button"
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
    </div>
  );
};

export default Attractions;
