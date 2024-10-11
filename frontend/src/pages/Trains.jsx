// src/pages/Trains.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  GoogleMap,
  useLoadScript,
  MarkerClusterer,
  InfoWindow,
  TransitLayer,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import axios from 'axios';
import '../styles/Trains.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

// Define categories specific to Trains
const categories = [
  { name: 'Train Stations', type: 'train_station', icon: '🚉' },
  { name: 'Subway Stations', type: 'subway_station', icon: '🚇' },
  { name: 'Bus Stations', type: 'bus_station', icon: '🚌' },
  { name: 'Transit Stations', type: 'transit_station', icon: '🚏' },
  // Add more categories as needed
];

const Trains = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext); // Access AuthContext
  const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Default to Paris center
  const [mapZoom, setMapZoom] = useState(12);
  const [markers, setMarkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]); // Initialize favorites as empty array
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // New States for Journey Planning
  const [journeys, setJourneys] = useState([]); // Stores fetched journeys
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyError, setJourneyError] = useState(null);

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
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/favorites`, {
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
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/favorites`,
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
      console.error('Error adding favorite:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data && err.response.data.errors) {
        // Display validation errors
        const messages = err.response.data.errors.map((error) => error.msg).join('\n');
        toast.error(`Error: ${messages}`);
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
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/favorites/${favoriteId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      // Update favorites state by removing the deleted favorite
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
    searchTrainsByType(category.type);
  };

  const searchTrainsByType = (type) => {
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
        setError('No train stations found for the selected category.');
        setMarkers([]);
        setIsLoading(false);
      }
    });
  };

  const searchTrainsByQuery = (query) => {
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
          type: ['train_station', 'subway_station', 'bus_station', 'transit_station'],
          keyword: query,
        };

        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setMarkers(results);
            setIsLoading(false);
          } else {
            setError('No train stations found for the specified search.');
            setMarkers([]);
            setIsLoading(false);
          }
        });
      } else {
        setError('Location not found. Please try a different search.');
        setMapCenter({ lat: 48.8566, lng: 2.3522 }); // Reset to Paris
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

    // Add marker to mapRef for cleanup
    if (!mapRef.current.markers) {
      mapRef.current.markers = [];
    }
    mapRef.current.markers.push(marker);
  };

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
      if (mapRef.current && mapRef.current.markers) {
        mapRef.current.markers.forEach((marker) => marker.setMap(null));
        mapRef.current.markers = [];
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

  // Handler for journey search form submission
  const handleJourneySearch = (e) => {
    e.preventDefault();
    const origin = e.target.origin.value.trim();
    const destination = e.target.destination.value.trim();
    const date = e.target.date.value;
    const time = e.target.time.value;

    if (!origin || !destination || !date || !time) {
      toast.error('Please fill in all fields.');
      return;
    }

    // Parse date and time inputs
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const departureDateTime = new Date(year, month - 1, day, hours, minutes);

    // Validate departure time
    const now = new Date();
    if (departureDateTime < now) {
      toast.error('Please select a future date and time for your journey.');
      return;
    }

    setDirectionsResponse(null);
    setJourneyLoading(true);
    setJourneyError(null);
    setJourneys([]);

    // Update the map center to the origin
    searchTrainsByQuery(origin);

    // DirectionsService request
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.TRANSIT,
        transitOptions: {
          departureTime: departureDateTime,
          modes: ['TRAIN', 'SUBWAY', 'BUS'],
        },
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);

          // Extract journey details
          const fetchedJourneys = result.routes.map((route, index) => {
            const leg = route.legs[0];
            const steps = leg.steps;
            const transitSteps = steps.filter(step => step.travel_mode === 'TRANSIT');
            const transitStops = transitSteps.map(step => step.transit.line.name);
            const transitLines = transitSteps.map(step => step.transit.line.vehicle.name);
            const schedule = steps.map((step) => ({
              segment: step.instructions,
              departure: step.transit ? formatTime(step.transit.departure_time.value) : '',
              arrival: step.transit ? formatTime(step.transit.arrival_time.value) : '',
            }));

            return {
              departureTime: formatTime(leg.departure_time.value),
              arrivalTime: formatTime(leg.arrival_time.value),
              origin: leg.start_address,
              destination: leg.end_address,
              transitStops: transitStops,
              transitLines: transitLines,
              schedule: schedule,
            };
          });
          setJourneys(fetchedJourneys);
        } else {
          console.error('Directions request failed due to ' + status);
          setJourneyError('Failed to fetch journey details. Please ensure your inputs are correct.');
          toast.error('Failed to fetch journey details. Please ensure your inputs are correct.');
        }
        setJourneyLoading(false);
      }
    );
  };

  // Helper function to format UNIX timestamp to HH:MM format
  const formatTime = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loadError) return <div className="trains-component-error">Error loading maps</div>;
  if (!isLoaded || authLoading) return <div className="trains-component-spinner"><div className="spinner"></div> Loading Maps...</div>;

  return (
    <div className="trains-component">
      <ToastContainer />
      {/* Banner Section */}
      <div className="trains-component-banner">
        <div className="trains-component-banner-content">
          <h1>Discover Train Stations</h1>
          <p>Find and explore train stations near you</p>
          <button onClick={() => document.getElementById('search-input').focus()} className="trains-component-explore-button">
            Explore Now
          </button>
        </div>
      </div>

      {/* Journey Search Form */}
      <div className="trains-component-journey-search-section">
        <h2>Plan Your Journey</h2>
        <form className="trains-component-journey-form" onSubmit={handleJourneySearch}>
          <div className="trains-component-form-group">
            <label htmlFor="origin">Origin:</label>
            <input
              id="origin"
              name="origin"
              type="text"
              placeholder="Enter origin station or city"
              required
              aria-label="Origin"
            />
          </div>
          <div className="trains-component-form-group">
            <label htmlFor="destination">Destination:</label>
            <input
              id="destination"
              name="destination"
              type="text"
              placeholder="Enter destination station or city"
              required
              aria-label="Destination"
            />
          </div>
          <div className="trains-component-form-group">
            <label htmlFor="date">Date:</label>
            <input
              id="date"
              name="date"
              type="date"
              required
              aria-label="Date of journey"
            />
          </div>
          <div className="trains-component-form-group">
            <label htmlFor="time">Time:</label>
            <input
              id="time"
              name="time"
              type="time"
              required
              aria-label="Time of journey"
            />
          </div>
          <button type="submit" className="trains-component-search-journey-button" disabled={journeyLoading}>
            {journeyLoading ? 'Searching...' : 'Search Journeys'}
          </button>
        </form>
        {journeyError && <div className="trains-component-error-message">{journeyError}</div>}
      </div>

      {/* Categories Section */}
      <div className="trains-component-categories-section">
        <h2>Explore by Type</h2>
        <div className="trains-component-categories-grid">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`trains-component-category-item ${selectedCategory === category.name ? 'selected' : ''}`}
              onClick={() => handleCategoryClick(category)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter') handleCategoryClick(category); }}
            >
              <div className="trains-component-category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="trains-component-map-search-section">
        <div className="trains-component-map-search-bar">
          <input
            id="search-input"
            type="text"
            placeholder="Search for a city or station..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query) {
                  setIsLoading(true);
                  searchTrainsByQuery(query);
                }
              }
            }}
            aria-label="Search for a city or station"
          />
          <button onClick={() => {
            const query = document.getElementById('search-input').value.trim();
            if (query) {
              setIsLoading(true);
              searchTrainsByQuery(query);
            }
          }} aria-label="Search" className="trains-component-search-button">
            Search
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="trains-component-map-section">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={mapZoom}
          center={mapCenter}
          options={options}
          onLoad={onMapLoad}
        >
          {/* Transit Layer */}
          <TransitLayer />

          {/* Directions Renderer */}
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
            />
          )}

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
              <div className="trains-component-info-window">
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
                    className="trains-component-info-window-image"
                    loading="lazy"
                  />
                ) : (
                  <img
                    src="https://via.placeholder.com/400"
                    alt="No available"
                    className="trains-component-info-window-image"
                    loading="lazy"
                  />
                )}
                {selected.reviews && selected.reviews.length > 0 && (
                  <div className="trains-component-reviews">
                    <h4>User Reviews</h4>
                    {selected.reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="trains-component-review">
                        <p><strong>{review.author_name}</strong></p>
                        <p>{review.text}</p>
                        <p>Rating: {review.rating} ⭐</p>
                      </div>
                    ))}
                  </div>
                )}
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noopener noreferrer" className="trains-component-website-link">
                    Visit Website
                  </a>
                )}
                {selected.url && (
                  <a href={selected.url} target="_blank" rel="noopener noreferrer" className="trains-component-google-maps-link">
                    View on Google Maps
                  </a>
                )}
                <div className="trains-component-info-buttons">
                  <button
                    onClick={() => {
                      const favoriteData = {
                        type: 'train_station', // Ensure this aligns with backend
                        placeId: selected.place_id,
                        name: selected.name,
                        address: selected.formatted_address || '',
                        rating: selected.rating || null,
                        priceLevel: selected.price_level || null,
                        photoReference: selected.photos && selected.photos.length > 0 ? selected.photos[0].photo_reference : null
                      };
                      addFavoriteToDB(favoriteData);
                    }}
                    className="trains-component-favorite-button"
                  >
                    Add to Favorites
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Dynamic Trains Section */}
      { (markers.length > 0 || isLoading || error) && (
        <div className="trains-component-dynamic-trains">
          <h2>{selectedCategory ? `${selectedCategory} Stations` : 'Train Stations'}</h2>
          {isLoading && <div className="trains-component-spinner"><div className="spinner"></div> Loading train stations...</div>}
          {error && <div className="trains-component-error-message">{error}</div>}
          <div className="trains-component-grid">
            {markers.map((train) => (
              <div key={train.place_id} className="trains-component-item">
                <button
                  onClick={() => fetchPlaceDetails(train.place_id)}
                  className="trains-component-image-button"
                  aria-label={`View details for ${train.name}`}
                >
                  {train.photos && train.photos.length > 0 ? (
                    <img
                      src={getPhotoUrl(train.photos[0].photo_reference)}
                      alt={train.name}
                      className="trains-component-placeholder"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/400"
                      alt="No available"
                      className="trains-component-placeholder"
                      loading="lazy"
                    />
                  )}
                </button>
                <div className="trains-component-info">
                  <h3>{train.name}</h3>
                  {train.rating && <p>Rating: {train.rating} ⭐</p>}
                  {train.price_level !== undefined && (
                    <p>Price Level: {'$'.repeat(train.price_level)}</p>
                  )}
                  <div className="trains-component-actions">
                    <button
                      onClick={() => fetchPlaceDetails(train.place_id)}
                      className="trains-component-view-details-button"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        const favoriteData = {
                          type: 'train_station', // Ensure this aligns with backend
                          placeId: train.place_id,
                          name: train.name,
                          address: train.vicinity || train.formatted_address || '',
                          rating: train.rating || null,
                          priceLevel: train.price_level || null,
                          photoReference: train.photos && train.photos.length > 0 ? train.photos[0].photo_reference : null
                        };
                        addFavoriteToDB(favoriteData);
                      }}
                      className="trains-component-favorite-button-small"
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

      {/* Journeys Section */}
      { (journeys.length > 0 || journeyLoading || journeyError) && (
        <div className="trains-component-journeys-section">
          <h2>Your Journeys</h2>
          {journeyLoading && <div className="trains-component-spinner"><div className="spinner"></div> Loading journeys...</div>}
          {journeyError && <div className="trains-component-error-message">{journeyError}</div>}
          <div className="trains-component-journeys-grid">
            {journeys.map((journey, index) => (
              <div key={index} className="trains-component-journey-item">
                <h3>Journey {index + 1}</h3>
                <p>
                  <strong>Departure:</strong> {journey.departureTime} from {journey.origin}
                </p>
                <p>
                  <strong>Arrival:</strong> {journey.arrivalTime} at {journey.destination}
                </p>
                <div className="trains-component-transit-stops">
                  <h4>Transit Stops:</h4>
                  <ul>
                    {journey.transitStops.map((stop, idx) => (
                      <li key={idx}>{stop}</li>
                    ))}
                  </ul>
                </div>
                <div className="trains-component-transit-lines">
                  <h4>Transit Lines:</h4>
                  <ul>
                    {journey.transitLines.map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div className="trains-component-schedule">
                  <h4>Schedule:</h4>
                  <ul>
                    {journey.schedule.map((segment, idx) => (
                      <li key={idx}>
                        {segment.segment}: {segment.departure} - {segment.arrival}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorites Section */}
      <div className="trains-component-favorites-section">
        <h2>Your Favorite Train Stations</h2>
        {favorites.length > 0 ? (
          <div className="trains-component-favorites-grid">
            {favorites.map((fav) => (
              <div key={fav.id} className="trains-component-favorite-item">
                <button
                  onClick={() => fetchPlaceDetails(fav.placeId)}
                  className="trains-component-favorite-image-button"
                  aria-label={`View details for ${fav.name}`}
                >
                  {fav.photoReference ? (
                    <img
                      src={getPhotoUrl(fav.photoReference)}
                      alt={fav.name}
                      className="trains-component-placeholder"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/400"
                      alt="No available"
                      className="trains-component-placeholder"
                      loading="lazy"
                    />
                  )}
                </button>
                <div className="trains-component-favorite-info">
                  <h3>{fav.name}</h3>
                  {fav.rating && <p>Rating: {fav.rating} ⭐</p>}
                  {fav.priceLevel !== undefined && (
                    <p>Price Level: {'$'.repeat(fav.priceLevel)}</p>
                  )}
                  <div className="trains-component-favorite-actions">
                    <button
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${fav.placeId}`;
                        window.open(mapsUrl, '_blank');
                      }}
                      className="trains-component-google-maps-button"
                    >
                      View in Google Maps
                    </button>
                    <button
                      onClick={() => removeFavoriteFromDB(fav.id)}
                      className="trains-component-delete-favorite-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You have no favorite train stations yet.</p>
        )}
      </div>
    </div>
  );
};

export default Trains;
