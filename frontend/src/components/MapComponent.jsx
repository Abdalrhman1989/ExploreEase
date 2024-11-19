import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GoogleMap,
  useLoadScript,
  DirectionsRenderer,
  Autocomplete,
  InfoWindow,
  Marker,
} from '@react-google-maps/api';
import PropTypes from 'prop-types';
import '../styles/MapComponent.css'; 

const libraries = ['places']; 
const mapContainerStyle = {
  width: '100%',
  height: '500px',
  position: 'relative',
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
};

const searchBarStyle = {
  position: 'absolute',
  top: '10px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '300px',
  zIndex: 5, 
};

const travelModeButtonStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '10px',
  marginTop: '10px',
};

// Define the types of places you want to fetch
const DESTINATION_TYPES = ['tourist_attraction', 'restaurant', 'lodging', 'museum'];

// Define marker icons based on place type
const MARKER_ICONS = {
  tourist_attraction: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  restaurant: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  lodging: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
  museum: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', 
  destination: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  searched_place: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  user_location: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
};

const MapComponent = ({
  cityData,
  userLocation,
  travelMode,
  setTravelMode,
}) => {
  const [selectedPlace, setSelectedPlace] = useState(null); 
  const [directions, setDirections] = useState(null); 
  const [autocomplete, setAutocomplete] = useState(null); 
  const [places, setPlaces] = useState([]); 
  const [placesLoading, setPlacesLoading] = useState(false); 
  const [placesError, setPlacesError] = useState(null); 
  const [distanceInfo, setDistanceInfo] = useState(null);

  const mapRef = useRef(); 

  const GOOGLE_MAPS_API_KEY = 'AIzaSyAUsvB5yrnAISRSaSaoL-oCC3Su8LMFK3M';

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Fetch places using Places API for multiple types
  const fetchPlaces = useCallback(() => {
    if (!cityData || !isLoaded || !mapRef.current) return;

    setPlacesLoading(true);
    setPlacesError(null);

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const requests = DESTINATION_TYPES.map((type) => {
      return new Promise((resolve, reject) => {
        const request = {
          location: new window.google.maps.LatLng(
            cityData.coordinates.latitude,
            cityData.coordinates.longitude
          ),
          radius: '15000',
          type: type,
        };
        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const formattedResults = results.map((place) => ({
              id: place.place_id,
              name: place.name,
              address: place.vicinity,
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
              rating: place.rating,
              userRatingsTotal: place.user_ratings_total,
              types: place.types,
              category: type, // To identify the type
            }));
            resolve(formattedResults);
          } else {
            console.error(
              `PlacesService (${type}) was not successful for the following reason:`,
              status
            );
            reject(status);
          }
        });
      });
    });

    Promise.all(requests)
      .then((results) => {
        const combinedPlaces = results.flat();
        setPlaces(combinedPlaces);
      })
      .catch((error) => {
        setPlacesError(error);
      })
      .finally(() => {
        setPlacesLoading(false);
      });
  }, [cityData, isLoaded]);

  // Fetch places when cityData or map is loaded
  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Handle Autocomplete load
  const onLoadAutocomplete = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  // Handle place selection from Autocomplete
  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        console.log('Selected place:', place);
        setSelectedPlace({
          name: place.name,
          location: coords,
          address: place.formatted_address,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          category: 'searched_place', 
        });
        handleDirections(coords);
        mapRef.current.panTo(coords);
        mapRef.current.setZoom(14);
      }
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  // Handle marker click
  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
    setTravelMode(null); // 
    setDirections(null); // Clear existing directions
    setDistanceInfo(null); // Clear existing distance info
    mapRef.current.panTo(place.location);
    mapRef.current.setZoom(14);
  };

  // Fetch distance and duration using Distance Matrix API
  const fetchDistanceInfo = useCallback(
    (destination) => {
      if (!userLocation || !isLoaded) return;

      const service = new window.google.maps.DistanceMatrixService();

      service.getDistanceMatrix(
        {
          origins: [userLocation],
          destinations: [destination],
          travelMode: window.google.maps.TravelMode[travelMode],
          unitSystem: window.google.maps.UnitSystem.IMPERIAL, // or METRIC
          avoidTolls: false,
        },
        (response, status) => {
          if (status === 'OK') {
            const element = response.rows[0].elements[0];
            if (element.status === 'OK') {
              setDistanceInfo({
                distance: element.distance.text,
                duration: element.duration.text,
              });
            } else {
              console.error(
                'Distance Matrix Element Status not OK:',
                element.status
              );
              setDistanceInfo(null);
            }
          } else {
            console.error('Error fetching distance matrix:', status);
            setDistanceInfo(null);
          }
        }
      );
    },
    [userLocation, travelMode, isLoaded]
  );

  // Handle directions calculation
  const handleDirections = (destination) => {
    if (!userLocation) {
      alert('User location not available. Please allow location access.');
      return;
    }

    if (!travelMode) {
      alert('Please select a travel mode.');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: userLocation,
        destination,
        travelMode: window.google.maps.TravelMode[travelMode], // Dynamic travel mode
        provideRouteAlternatives: false, // Change to false to simplify
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          fetchDistanceInfo(destination); // Fetch distance info after directions
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  };

  // Handle map load
  const onMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      // After map is loaded, if selectedPlace exists and travelMode is set, fetch directions
      if (selectedPlace && travelMode) {
        handleDirections(selectedPlace.location);
      }
    },
    [selectedPlace, travelMode, handleDirections]
  );

  // Handle travel mode change
  useEffect(() => {
    if (selectedPlace && travelMode) {
      handleDirections(selectedPlace.location);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelMode]);

  if (loadError)
    return (
      <div className="error">
        Error loading maps. Please try again later.
      </div>
    );
  if (!isLoaded)
    return <div className="loading">Loading map...</div>;

  return (
    <div className="map-component">
      <h2>Location and Attractions</h2>

      <div style={{ position: 'relative' }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={12}
          center={{
            lat: cityData.coordinates.latitude,
            lng: cityData.coordinates.longitude,
          }}
          options={options}
          onLoad={onMapLoad}
        >
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: MARKER_ICONS['user_location'],
              }}
              title="Your Location"
            />
          )}

          {/* Destination Marker */}
          <Marker
            position={{
              lat: cityData.coordinates.latitude,
              lng: cityData.coordinates.longitude,
            }}
            onClick={() => {
              setSelectedPlace({
                name: cityData.title,
                address: cityData.description,
                location: cityData.coordinates,
                rating: cityData.rating || null,
                userRatingsTotal: cityData.userRatingsTotal || null,
                category: 'destination', // To identify as destination
              });
              // Do not automatically fetch directions; wait for travel mode selection
              setTravelMode(null); // Reset travel mode
              setDirections(null); // Clear existing directions
              setDistanceInfo(null); // Clear distance info
            }}
            icon={{
              url: MARKER_ICONS['destination'],
            }}
            title={cityData.title}
          />

          {/* Places Markers */}
          {places.map((place) => (
            <Marker
              key={place.id}
              position={place.location}
              onClick={() => handleMarkerClick(place)}
              icon={{
                url:
                  MARKER_ICONS[place.category] ||
                  MARKER_ICONS['tourist_attraction'],
              }}
              title={place.name}
            />
          ))}

          {/* InfoWindow */}
          {selectedPlace && (
            <InfoWindow
              position={selectedPlace.location}
              onCloseClick={() => setSelectedPlace(null)}
              options={{ maxWidth: 300 }}
            >
              <div className="info-window">
                <h3>{selectedPlace.name}</h3>
                <p>{selectedPlace.address}</p>
                {selectedPlace.rating && (
                  <p>
                    Rating: {selectedPlace.rating} (
                    {selectedPlace.userRatingsTotal} reviews)
                  </p>
                )}
                {/* Display Distance and Duration */}
                {distanceInfo && (
                  <div className="distance-info">
                    <h4>Distance:</h4>
                    <p>
                      {travelMode.charAt(0) +
                        travelMode.slice(1).toLowerCase()}
                      : {distanceInfo.distance} (
                      {distanceInfo.duration})
                    </p>
                  </div>
                )}
                <div className="info-window-buttons">
                  <button
                    onClick={() => handleDirections(selectedPlace.location)}
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Directions Renderer */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{ suppressMarkers: true }}
            />
          )}
        </GoogleMap>

        {/* Search Bar (Autocomplete) */}
        <div style={searchBarStyle}>
          <Autocomplete
            onLoad={onLoadAutocomplete}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type="text"
              placeholder="Search for places"
              style={{
                boxSizing: `border-box`,
                border: `1px solid #ccc`,
                width: `100%`,
                height: `40px`,
                padding: `0 12px`,
                borderRadius: `4px`,
                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                fontSize: `16px`,
                outline: `none`,
              }}
            />
          </Autocomplete>
        </div>

        {/* Conditionally Render Travel Mode Buttons */}
        {selectedPlace && (
          <div
            style={travelModeButtonStyle}
            className="travel-mode-buttons"
          >
            <button
              className={travelMode === 'DRIVING' ? 'active' : ''}
              onClick={() => setTravelMode('DRIVING')}
            >
              🚗 Drive
            </button>
            <button
              className={travelMode === 'WALKING' ? 'active' : ''}
              onClick={() => setTravelMode('WALKING')}
            >
              🚶 Walk
            </button>
            <button
              className={travelMode === 'BICYCLING' ? 'active' : ''}
              onClick={() => setTravelMode('BICYCLING')}
            >
              🚴 Bike
            </button>
            <button
              className={travelMode === 'TRANSIT' ? 'active' : ''}
              onClick={() => setTravelMode('TRANSIT')}
            >
              🚌 Transit
            </button>
          </div>
        )}
      </div>

      {/* Loading and Error States for Places */}
      {placesLoading && <div className="loading">Loading places...</div>}
      {placesError && (
        <div className="error">Error loading places: {placesError}</div>
      )}
    </div>
  );
};

// Define PropTypes for better type checking
MapComponent.propTypes = {
  cityData: PropTypes.object.isRequired,
  userLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  travelMode: PropTypes.string,
  setTravelMode: PropTypes.func.isRequired,
};

export default MapComponent;
