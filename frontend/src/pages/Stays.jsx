import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import {
  GoogleMap,
  useLoadScript,
  MarkerClusterer,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Stays.css';
import hotelPlaceholder from '../assets/hotel1.jpg'; 
import bannerHotel from '../assets/hotel.jpg'; 

import ApprovedHotels from '../components/ApprovedHotels'; 
import { toast } from 'react-toastify';

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
};

// Categories specific to stays
const stayCategories = [
  { name: 'Hotels', type: 'hotel', icon: '🏨' },
  { name: 'Apartments', type: 'apartment', icon: '🏢' },
  { name: 'Resorts', type: 'resort', icon: '🏖️' },
  { name: 'Hostels', type: 'hostel', icon: '🏘️' },
];

const Stays = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 }); // World center
  const [mapZoom, setMapZoom] = useState(2); // Zoom level for world view
  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [bannerImage, setBannerImage] = useState(null); 
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const mapSectionRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const getCategoryIcon = (type) => {
    const category = stayCategories.find((cat) => cat.type === type);
    if (category) {
      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30">
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24">${category.icon}</text>
        </svg>`
      )}`;
    }
    
    return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  };

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const idToken = await user.getIdToken();
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.get(`${backendUrl}/api/favorites`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setFavorites(response.data.favorites);
    } catch (err) {
      console.error('Error fetching favorites:', err.response ? err.response.data : err.message);
      setError('Failed to fetch favorites.');
    }
  }, [isAuthenticated, user]);

  const addFavoriteToDB = useCallback(async (favoriteData) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to add favorites.');
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.post(
        `${backendUrl}/api/favorites`,
        favoriteData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setFavorites((prevFavorites) => [...prevFavorites, response.data.favorite]);
      toast.success('Favorite added successfully!');
    } catch (err) {
      console.error('Error adding favorite:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data) {
        if (Array.isArray(err.response.data.errors)) {
          const errorMessages = err.response.data.errors.map(error => error.msg).join('\n');
          toast.error(`Error: ${errorMessages}`);
        } else if (err.response.data.Objecterrors && Array.isArray(err.response.data.Objecterrors)) {
          const errorMessages = err.response.data.Objecterrors.map(error => error.msg).join('\n');
          toast.error(`Error: ${errorMessages}`);
        } else if (err.response.data.message) {
          toast.error(`Error: ${err.response.data.message}`);
        } else {
          toast.error('Failed to add favorite.');
        }
      } else {
        toast.error('Failed to add favorite.');
      }
    }
  }, [isAuthenticated, user]);
  
  const removeFavoriteFromDB = useCallback(async (favoriteId) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to remove favorites.');
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      await axios.delete(`${backendUrl}/api/favorites/${favoriteId}`, {
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
  }, [isAuthenticated, user]);

  // Handle category click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setError(null);
    setIsLoading(true);
    setPlaces([]);
    setSelected(null);
    searchStaysByType(category.type);
  };

  // Search stays by type using current map center
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
        console.error('Nearby Search failed:', status);
        setError('No places found for the selected category.');
        setPlaces([]);
        setIsLoading(false);
      }
    });
  };

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
        setMapCenter({
          lat: location.lat(),
          lng: location.lng(),
        });
        setMapZoom(12);
        setSelectedCategory(null);
        setError(null);

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
            console.error('Nearby Search failed:', status);
            setError('No places found for the specified search.');
            setPlaces([]);
            setIsLoading(false);
          }
        });
      } else {
        console.error('Geocoding failed:', status);
        setError('Location not found. Showing world overview.');
        setMapCenter({ lat: 0, lng: 0 }); // World center
        setMapZoom(2); // World view
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
    return null;
  };

  const fetchPlaceDetails = (placeId) => {
    if (!window.google || !mapRef.current) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.getDetails(
      {
        placeId: placeId,
        fields: [
          'name',
          'rating',
          'price_level',
          'formatted_address',
          'photos',
          'reviews',
          'website',
          'url',
          'geometry',
          'types',
          'opening_hours',
          'formatted_phone_number',
          'international_phone_number',
        ],
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
          console.error('Failed to fetch place details:', status);
          setError('Failed to fetch place details.');
        }
      }
    );
  };

  const handleViewDetails = (placeId) => {
    fetchPlaceDetails(placeId);
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isLoaded && places.length > 0) {
      // You can implement any additional logic here if needed
    }
  }, [isLoaded, places]);

  // Fetch favorites when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]); 
    }
  }, [isAuthenticated, user, fetchFavorites]);

  // Fetch user's hotel and set map center accordingly
  const fetchUserHotel = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const idToken = await user.getIdToken();
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      const response = await axios.get(`${backendUrl}/api/hotels/user`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const userHotels = response.data.hotels;
      if (userHotels && userHotels.length > 0) {
        const userHotel = userHotels[0];
        geocodeAddress(userHotel.location);
      } else {
        console.warn('User has no hotels. Using world overview.');
        setMapCenter({ lat: 0, lng: 0 });
        setMapZoom(2);
      }
    } catch (err) {
      console.error('Error fetching user hotels:', err.response ? err.response.data : err.message);
      setError('Failed to fetch your hotel information.');
      setMapCenter({ lat: 0, lng: 0 });
      setMapZoom(2);
    }
  }, [isAuthenticated, user]);

  const geocodeAddress = (address) => {
    if (!window.google) {
      setError('Google Maps is not loaded properly.');
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        const location = results[0].geometry.location;
        setMapCenter({
          lat: location.lat(),
          lng: location.lng(),
        });
        setMapZoom(14); // Zoom into the location
        searchStaysByLocation(location);
      } else {
        console.error('Geocoding failed:', status);
        setError('Failed to locate your hotel. Showing world overview.');
        setMapCenter({ lat: 0, lng: 0 }); // World center
        setMapZoom(2); // World view
      }
    });
  };

  const searchStaysByLocation = (location, type = 'lodging') => {
    if (!window.google) {
      setError('Google Maps is not loaded properly.');
      setIsLoading(false);
      return;
    }

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: location,
      radius: '10000',
      type: [type],
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setPlaces(results);
        setIsLoading(false);
      } else {
        console.error('Nearby Search failed:', status);
        setError('No places found for the selected category.');
        setPlaces([]);
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    if (isLoaded && window.google) {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        placeId: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ', // Example Place ID
        fields: ['photos'],
      };

      service.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.photos && place.photos.length > 0) {
          const photoUrl = getPhotoUrl(place.photos[0].photo_reference);
          setBannerImage(photoUrl);
        } else {
          console.error('Failed to fetch banner image:', status);
          setBannerImage(null); 
        }
      });
    }
  }, [isLoaded]);

  // Fetch user's location or default to world overview
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserHotel();
    } else {
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
            console.error('Error fetching user location:', error);
            setMapCenter({ lat: 0, lng: 0 }); // World center
            setMapZoom(2); // World view
          }
        );
      } else {
        console.error('Geolocation not supported by this browser.');
        setMapCenter({ lat: 0, lng: 0 }); // World center
        setMapZoom(2); // World view
      }
    }
  }, [isAuthenticated, user, fetchUserHotel]);

  if (loadError) {
    console.error('Error loading Google Maps:', loadError);
    return <div className="stays-component-error-message">Error loading maps</div>;
  }
  if (!isLoaded || authLoading) {
    return (
      <div className="stays-component-spinner">
        <div className="spinner"></div>
        <p>Loading Maps...</p>
      </div>
    );
  }

  return (
    <div className="stays-component">
      {/* Banner Section */}
      <div
        className="stays-component-banner"
        style={{
          backgroundImage: bannerImage
            ? `url(${bannerImage})`
            : `url(${bannerHotel}), var(--primary-gradient)`,
        }}
      >
        <div className="stays-component-banner-overlay">
          <div className="stays-component-banner-content">
            <h1>Find Your Perfect Stay</h1>
            <p>Browse thousands of hotels, apartments, resorts, and more</p>
            <button
              onClick={() => {
                const searchBar = document.getElementById('search-bar');
                if (searchBar) {
                  searchBar.scrollIntoView({ behavior: 'smooth' });
                } else {
                  console.error('Search bar element not found');
                }
              }}
              className="stays-component-explore-button"
              aria-label="Explore Stays"
            >
              Explore Stays
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="stays-component-map-search-section" id="search-bar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const query = e.target.elements.search.value.trim();
            if (query) {
              setIsLoading(true);
              searchStaysByQuery(query);
            } else {
              toast.warning('Please enter a search term.');
            }
          }}
          className="stays-component-journey-form"
          aria-label="Search for stays"
        >
          <div className="stays-component-form-group">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              name="search"
              placeholder="Search for a city or place to stay..."
              className="stays-component-search-input"
              aria-label="Search input"
              id="search"
            />
          </div>
          <button type="submit" className="stays-component-search-journey-button" aria-label="Search">
            Search
          </button>
        </form>
      </div>

      {/* Categories Section */}
      <div className="stays-component-categories-section">
        <h2>Explore by Category</h2>
        <div className="stays-component-categories-grid">
          {stayCategories.map((category) => (
            <div
              key={category.type}
              className={`stays-component-category-item ${selectedCategory === category.name ? 'selected' : ''}`}
              onClick={() => handleCategoryClick(category)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter') handleCategoryClick(category); }}
              aria-label={`Explore ${category.name}`}
            >
              <div className="stays-component-category-icon">{category.icon}</div>
              <h3 className="stays-component-category-name">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Map Section */}
      <div className="stays-component-map-section" ref={mapSectionRef}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={mapZoom}
          center={mapCenter}
          options={options}
          onLoad={onMapLoad}
        >
          <MarkerClusterer>
            {(clusterer) =>
              places.map((place) => {
                const primaryType = place.types.find(type => typeMapping[type]) || 'hotel';
                const mappedType = typeMapping[primaryType] || 'hotel';

                return (
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
                      url: getCategoryIcon(mappedType),
                      scaledSize: new window.google.maps.Size(30, 30),
                    }}
                    aria-label={`Marker for ${place.name}`}
                  />
                );
              })
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
              <div className="stays-component-info-window">
                <h3>{selected.name}</h3>
                {selected.rating && <p>Rating: {selected.rating} ⭐</p>}
                {selected.price_level !== undefined && (
                  <p>Price Level: {'$'.repeat(selected.price_level)}</p>
                )}
                {selected.formatted_address && <p>{selected.formatted_address}</p>}

                {/* Display Photo */}
                {selected.photos && selected.photos.length > 0 ? (
                  <div className="stays-component-photo-section">
                    <img
                      src={getPhotoUrl(selected.photos[0].photo_reference)}
                      alt={`${selected.name} photo`}
                      className="stays-component-info-window-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = hotelPlaceholder;
                      }}
                    />
                    {/* Author Attribution */}
                    {selected.photos[0].html_attributions && selected.photos[0].html_attributions.length > 0 && (
                      <p
                        className="stays-component-author-attribution"
                        dangerouslySetInnerHTML={{ __html: selected.photos[0].html_attributions[0] }}
                      ></p>
                    )}
                  </div>
                ) : (
                  <div className="stays-component-photo-section">
                    <p>No image available.</p>
                  </div>
                )}

                {/* User Reviews */}
                {selected.reviews && selected.reviews.length > 0 && (
                  <div className="stays-component-reviews">
                    <h4>User Reviews</h4>
                    {selected.reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="stays-component-review">
                        <p><strong>{review.author_name}</strong></p>
                        <p>{review.text}</p>
                        <p>Rating: {review.rating} ⭐</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Opening Hours */}
                {selected.opening_hours && selected.opening_hours.weekday_text && (
                  <div className="stays-component-opening-hours">
                    <h4>Opening Hours</h4>
                    <ul>
                      {selected.opening_hours.weekday_text.map((day, index) => (
                        <li key={index}>{day}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contact Information */}
                {selected.formatted_phone_number && (
                  <p>Phone: {selected.formatted_phone_number}</p>
                )}
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noopener noreferrer" className="stays-component-website-link">
                    Visit Website
                  </a>
                )}
                {selected.url && (
                  <a href={selected.url} target="_blank" rel="noopener noreferrer" className="stays-component-google-maps-link">
                    View on Google Maps
                  </a>
                )}

                {/* Add to Favorites Button */}
                <div className="stays-component-info-buttons">
                  <button
                    onClick={() => {
                      const primaryType = selected.types.find(type => typeMapping[type]) || 'hotel';
                      const categoryType = typeMapping[primaryType] || 'hotel'; 
                      const favoriteData = {
                        type: categoryType, 
                        placeId: selected.place_id,
                        name: selected.name,
                        address: selected.formatted_address || '',
                        rating: selected.rating || null,
                        priceLevel: selected.price_level || null,
                        photoReference: selected.photos && selected.photos.length > 0 ? selected.photos[0].photo_reference : null
                      };
                      addFavoriteToDB(favoriteData);
                    }}
                    className="stays-component-favorite-button"
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

      {/* Dynamic Stays Section */}
      {places.length > 0 && (
        <div className="stays-component-dynamic-stays">
          <h2>{selectedCategory ? `${selectedCategory} Stays` : 'Available Stays'}</h2>
          {isLoading && (
            <div className="stays-component-spinner">
              <div className="spinner"></div>
              <p>Loading stays...</p>
            </div>
          )}
          {error && <div className="stays-component-error-message">{error}</div>}
          <div className="stays-component-grid">
            {places.length > 0 ? (
              places.map((stay) => {
                const primaryType = stay.types.find(type => typeMapping[type]) || 'hotel';
                const mappedType = typeMapping[primaryType] || 'hotel';

                return (
                  <div key={stay.place_id} className="stays-component-item">
                    <button
                      onClick={() => fetchPlaceDetails(stay.place_id)}
                      className="stays-component-image-button"
                      aria-label={`View details for ${stay.name}`}
                    >
                      {stay.photos && stay.photos.length > 0 ? (
                        <img
                          src={getPhotoUrl(stay.photos[0].photo_reference)}
                          alt={`${stay.name} photo`}
                          className="stays-component-placeholder"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = hotelPlaceholder;
                          }}
                        />
                      ) : (
                        <div className="stays-component-placeholder no-image">
                          <p>No image available.</p>
                        </div>
                      )}
                    </button>
                    <div className="stays-component-info">
                      <h3>{stay.name}</h3>
                      {stay.rating && <p>Rating: {stay.rating} ⭐</p>}
                      {stay.price_level !== undefined && (
                        <p>Price Level: {'$'.repeat(stay.price_level)}</p>
                      )}
                      <p>{stay.vicinity || stay.formatted_address || 'No address available'}</p>
                      <div className="stays-component-actions">
                        <button
                          onClick={() => handleViewDetails(stay.place_id)}
                          className="stays-component-view-details-button"
                          aria-label={`View details for ${stay.name}`}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            const favoriteData = {
                              type: mappedType, 
                              placeId: stay.place_id,
                              name: stay.name,
                              address: stay.vicinity || stay.formatted_address || '',
                              rating: stay.rating || null,
                              priceLevel: stay.price_level || null,
                              photoReference: stay.photos && stay.photos.length > 0 ? stay.photos[0].photo_reference : null
                            };
                            addFavoriteToDB(favoriteData);
                          }}
                          className="stays-component-add-favorite-button"
                          aria-label={`Add ${stay.name} to Favorites`}
                        >
                          Add to Favorites
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              !isLoading && <p className="no-stays-message">No stays to display.</p>
            )}
          </div>
        </div>
      )}

      {/* Approved Hotels Section */}
      <ApprovedHotels currentLocation={mapCenter} />

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="stays-component-favorites-section">
          <h2>Your Favorites</h2>
          <div className="stays-component-favorites-grid">
            {favorites
              .filter(fav => fav.type === 'hotel') 
              .map((fav) => (
                <div key={fav.id} className="stays-component-favorite-item">
                  <button
                    onClick={() => fetchPlaceDetails(fav.placeId)}
                    className="stays-component-favorite-image-button"
                    aria-label={`View details for ${fav.name}`}
                  >
                    {fav.photoReference ? (
                      <img
                        src={getPhotoUrl(fav.photoReference)}
                        alt={`${fav.name} photo`}
                        className="stays-component-placeholder"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = hotelPlaceholder;
                        }}
                      />
                    ) : (
                      <div className="stays-component-placeholder no-image">
                        <p>No image available.</p>
                      </div>
                    )}
                  </button>
                  <div className="stays-component-favorite-info">
                    <h3>{fav.name}</h3>
                    {fav.rating && <p>Rating: {fav.rating} ⭐</p>}
                    {fav.priceLevel !== undefined && (
                      <p>Price Level: {'$'.repeat(fav.priceLevel)}</p>
                    )}
                    <div className="stays-component-favorite-actions">
                      <button
                        onClick={() => {
                          const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${fav.placeId}`;
                          window.open(mapsUrl, '_blank');
                        }}
                        className="stays-component-google-maps-button"
                        aria-label={`View ${fav.name} on Google Maps`}
                      >
                        View in Maps
                      </button>
                      <button
                        onClick={() => removeFavoriteFromDB(fav.id)}
                        className="stays-component-delete-favorite-button"
                        aria-label={`Delete ${fav.name} from Favorites`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stays;
