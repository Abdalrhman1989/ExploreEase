import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  GoogleMap,
  useLoadScript,
  MarkerClusterer,
  InfoWindow,
} from '@react-google-maps/api';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import axios from 'axios';
import '../styles/Attractions.css';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

// Ensure you have set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file
const Attractions = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext); // Access AuthContext
  const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Paris center
  const [mapZoom, setMapZoom] = useState(12);
  const [markers, setMarkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]); // Initialize favorites as empty array
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // Define categories array
  const categories = [
    { name: 'Adventure', type: 'park', icon: '🚵' },
    { name: 'Cultural', type: 'museum', icon: '🏛️' },
    { name: 'Nature', type: 'natural_feature', icon: '🌳' },
    { name: 'Historical', type: 'tourist_attraction', icon: '🏰' },
    { name: 'Food & Drink', type: 'restaurant', icon: '🍽️' },
    { name: 'Shopping', type: 'shopping_mall', icon: '🛍️' },
    { name: 'Nightlife', type: 'night_club', icon: '🎉' },
    { name: 'Health', type: 'hospital', icon: '🏥' },
    { name: 'Education', type: 'university', icon: '🎓' },
    { name: 'Entertainment', type: 'movie_theater', icon: '🎬' },
    { name: 'Sports', type: 'stadium', icon: '🏟️' },
    { name: 'Religious', type: 'hindu_temple', icon: '🕌' },
    { name: 'Transportation', type: 'parking', icon: '🅿️' },
    { name: 'Government', type: 'city_hall', icon: '🏢' },
    { name: 'Healthcare', type: 'pharmacy', icon: '💊' },
  ];

  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Function to fetch favorites from backend
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

  // Function to add a favorite via backend
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

  // Function to remove a favorite via backend
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
      // Update favorites state by removing the deleted favorite
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== favoriteId));
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
    setMarkers([]);
    setSelected(null);
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
        setMarkers(results);
        setIsLoading(false);
      } else {
        setError('No places found for the selected category.');
        setMarkers([]);
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
          type: ['tourist_attraction', 'lodging'],
          keyword: query,
        };

        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setMarkers(results);
            setIsLoading(false);
          } else {
            setError('No places found for the specified search.');
            setMarkers([]);
            setIsLoading(false);
          }
        });
      } else {
        setError('Location not found. Please try a different search.');
        setMapCenter({ lat: 48.8566, lng: 2.3522 });
        setMapZoom(12);
        setMarkers([]);
        setIsLoading(false);
      }
    });
  };

  const getPhotoUrl = (photoReference) => {
    if (photoReference) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
    }
    return 'https://via.placeholder.com/400'; // Fallback image if no photo reference
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

  // Define addAdvancedMarker to add markers using google.maps.marker.AdvancedMarkerElement
  const addAdvancedMarker = (position, place) => {
    if (!window.google || !mapRef.current) return;

    const MarkerClass = window.google.maps?.marker?.AdvancedMarkerElement || window.google.maps.Marker;

    const marker = new MarkerClass({
      map: mapRef.current,
      position,
      title: place.name,
      // Optionally, set a custom icon based on category
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
  };

  const getCategoryIcon = (type) => {
    const category = categories.find((cat) => cat.type === type);
    if (category) {
      // You can replace emoji with actual icon URLs if desired
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
      markers.forEach((marker) => {
        if (marker.geometry && marker.geometry.location) {
          addAdvancedMarker(
            {
              lat: marker.geometry.location.lat(),
              lng: marker.geometry.location.lng(),
            },
            marker
          );
        } else {
          console.warn(`Marker with ID ${marker.place_id} is missing geometry/location.`);
        }
      });
    }
    // Cleanup markers on unmount or markers change
    return () => {
      if (mapRef.current) {
        mapRef.current.markers?.forEach((marker) => marker.setMap(null));
      }
    };
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

  if (loadError) return <div className="attractions-error">Error loading maps</div>;
  if (!isLoaded || authLoading) return <div className="attractions-loading">Loading Maps...</div>;

  return (
    <div className="attractions">
      {/* Banner Section */}
      <div className="attractions-banner">
        <div className="attractions-banner-content">
          <h1>Discover Attractions</h1>
          <p>Explore the world's best attractions</p>
          <button onClick={() => document.getElementById('search-input').focus()} className="attractions-explore-button">
            Explore Now
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="attractions-categories-section">
        <h2>Explore by Category</h2>
        <div className="attractions-categories-grid">
          {categories.map((category, index) => (
            <div
              key={index}
              className="attractions-category-item"
              onClick={() => handleCategoryClick(category)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter') handleCategoryClick(category); }}
            >
              <div className="attractions-category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="attractions-map-search-section">
        <div className="attractions-map-search-bar">
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
          }} aria-label="Search" className="attractions-search-button">
            Search
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="attractions-map-section">
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
              <div className="attractions-info-window">
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
                    className="attractions-info-window-image"
                    loading="lazy"
                  />
                ) : (
                  <img
                    src="https://via.placeholder.com/400"
                    alt="No available"
                    className="attractions-info-window-image"
                    loading="lazy"
                  />
                )}
                {selected.reviews && selected.reviews.length > 0 && (
                  <div className="attractions-reviews">
                    <h4>User Reviews</h4>
                    {selected.reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="attractions-review">
                        <p><strong>{review.author_name}</strong></p>
                        <p>{review.text}</p>
                        <p>Rating: {review.rating} ⭐</p>
                      </div>
                    ))}
                  </div>
                )}
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noopener noreferrer" className="attractions-website-link">
                    Visit Website
                  </a>
                )}
                {selected.url && (
                  <a href={selected.url} target="_blank" rel="noopener noreferrer" className="attractions-google-maps-link">
                    View on Google Maps
                  </a>
                )}
                <div className="attractions-info-buttons">
                  <button
                    onClick={() => {
                      const favoriteData = {
                        type: 'attraction', // Adjust type based on context or place types
                        placeId: selected.place_id,
                        name: selected.name,
                        address: selected.formatted_address || '',
                        rating: selected.rating || null,
                        priceLevel: selected.price_level || null,
                        photoReference: selected.photos && selected.photos.length > 0 ? selected.photos[0].photo_reference : null
                      };
                      addFavoriteToDB(favoriteData);
                    }}
                    className="attractions-favorite-button"
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
      <div className="attractions-dynamic-attractions">
        <h2>{selectedCategory ? `${selectedCategory} Attractions` : 'Attractions'}</h2>
        {isLoading && <div className="attractions-spinner">Loading attractions...</div>}
        {error && <div className="attractions-error-message">{error}</div>}
        <div className="attractions-grid">
          {markers.length > 0 ? (
            markers.map((attraction) => (
              <div key={attraction.place_id} className="attractions-item">
                <button
                  onClick={() => fetchPlaceDetails(attraction.place_id)}
                  className="attractions-image-button"
                  aria-label={`View details for ${attraction.name}`}
                >
                  {attraction.photos && attraction.photos.length > 0 ? (
                    <img
                      src={getPhotoUrl(attraction.photos[0].photo_reference)}
                      alt={attraction.name}
                      className="attractions-placeholder"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/400"
                      alt="No available"
                      className="attractions-placeholder"
                      loading="lazy"
                    />
                  )}
                </button>
                <div className="attractions-info">
                  <h3>{attraction.name}</h3>
                  {attraction.rating && <p>Rating: {attraction.rating} ⭐</p>}
                  {attraction.price_level !== undefined && (
                    <p>Price Level: {'$'.repeat(attraction.price_level)}</p>
                  )}
                  <div className="attractions-actions">
                    <button
                      onClick={() => fetchPlaceDetails(attraction.place_id)}
                      className="attractions-view-details-button"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        const favoriteData = {
                          type: 'attraction', // Adjust type based on context or place types
                          placeId: attraction.place_id,
                          name: attraction.name,
                          address: attraction.vicinity || attraction.formatted_address || '',
                          rating: attraction.rating || null,
                          priceLevel: attraction.price_level || null,
                          photoReference: attraction.photos && attraction.photos.length > 0 ? attraction.photos[0].photo_reference : null
                        };
                        addFavoriteToDB(favoriteData);
                      }}
                      className="attractions-favorite-button"
                    >
                      Add to Favorites
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            !isLoading && <p>No attractions to display.</p>
          )}
        </div>
      </div>

      {/* Favorites Section */}
      <div className="attractions-favorites-section">
        <h2>Your Favorites</h2>
        {favorites.length > 0 ? (
          <div className="attractions-favorites-grid">
            {favorites.map((fav) => (
              <div key={fav.id} className="attractions-favorite-item">
                <button
                  onClick={() => fetchPlaceDetails(fav.placeId)}
                  className="attractions-favorite-image-button"
                  aria-label={`View details for ${fav.name}`}
                >
                  {fav.photoReference ? (
                    <img
                      src={getPhotoUrl(fav.photoReference)}
                      alt={fav.name}
                      className="attractions-placeholder"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/400"
                      alt="No available"
                      className="attractions-placeholder"
                      loading="lazy"
                    />
                  )}
                </button>
                <div className="attractions-info">
                  <h3>{fav.name}</h3>
                  {fav.rating && <p>Rating: {fav.rating} ⭐</p>}
                  {fav.priceLevel !== undefined && (
                    <p>Price Level: {'$'.repeat(fav.priceLevel)}</p>
                  )}
                  <div className="attractions-favorite-actions">
                    <button
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${fav.placeId}`;
                        window.open(mapsUrl, '_blank');
                      }}
                      className="attractions-google-maps-button"
                    >
                      View in Google Maps
                    </button>
                    <button
                      onClick={() => removeFavoriteFromDB(fav.id)}
                      className="attractions-delete-favorite-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You have no favorite attractions yet.</p>
        )}
      </div>
    </div>
  );
};

export default Attractions;
