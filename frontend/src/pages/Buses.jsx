import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  GoogleMap,
  useLoadScript,
  MarkerClusterer,
  InfoWindow,
  TransitLayer,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { AuthContext } from '../context/AuthContext'; 
import axios from 'axios';
import moment from 'moment-timezone';
import '../styles/Buses.css'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBus, FaBusAlt } from 'react-icons/fa'; 
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import busBanner from '../assets/bus1.jpg'; 

const libraries = ['places']; 
const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

// Define categories specific to Buses
const categories = [
  {
    name: 'Bus Stations',
    type: 'bus_station',
    icon: <FaBusAlt size={40} color="inherit" />,
  },
  
];

const Buses = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext); 
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 }); 
  const [mapZoom, setMapZoom] = useState(12);
  const [markers, setMarkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // States for Journey Planning
  const [journeys, setJourneys] = useState([]);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyError, setJourneyError] = useState(null);

  // States for Saved Trips
  const [savedTrips, setSavedTrips] = useState([]);
  const [filteredSavedTrips, setFilteredSavedTrips] = useState([]);
  const [filterDate, setFilterDate] = useState(null);

  // API Keys from Environment Variables
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const GOOGLE_TIMEZONE_API_KEY = process.env.REACT_APP_GOOGLE_TIMEZONE_API_KEY;
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'; 

  // Load Google Maps Script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef(null);

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Helper function to validate URLs
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Helper function to validate UNIX timestamps
  const isValidUnixTimestamp = (timestamp) => {
    // Check if timestamp is a number and within a reasonable range (e.g., between 1970 and 3000)
    return (
      typeof timestamp === 'number' &&
      timestamp > 0 &&
      timestamp < 32503680000
    );
  };

  // Helper function to format UNIX timestamp with timezone
  const formatTime = (timestamp, timeZoneId) => {
    if (timestamp instanceof Date) {
      // Convert Date object to UNIX timestamp in seconds
      timestamp = Math.floor(timestamp.getTime() / 1000);
      console.warn(`formatTime received a Date object. Converted to UNIX timestamp: ${timestamp}`);
    }

    if (!isValidUnixTimestamp(timestamp)) {
      console.error(`Invalid UNIX timestamp: ${timestamp}`);
      return 'Invalid Time';
    }

    return moment.unix(timestamp).tz(timeZoneId).format('YYYY-MM-DD HH:mm');
  };

  // Helper function to format duration from seconds to "Xh Ym"
  const formatDuration = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds <= 0) {
      return 'Invalid Duration';
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Function to save a trip via backend
  const saveTripToDB = async (tripData) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to save trips.');
      return;
    }

    const requiredFields = ['type', 'origin', 'destination', 'departureTime', 'arrivalTime', 'duration'];
    const missingFields = requiredFields.filter((field) => !tripData[field]);

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (tripData.ticketProviderUrl && !isValidUrl(tripData.ticketProviderUrl)) {
      toast.error('Invalid Ticket Provider URL.');
      return;
    }

    if (!Number.isInteger(tripData.duration) || tripData.duration <= 0) {
      toast.error('Duration must be a positive integer.');
      return;
    }

    try {
      // Convert departureTime and arrivalTime to ISO strings
      const tripDataToSend = {
        ...tripData,
        departureTime: new Date(tripData.departureTime * 1000).toISOString(),
        arrivalTime: new Date(tripData.arrivalTime * 1000).toISOString(),
      };

      console.log('Trip Data to Send:', tripDataToSend); 

      const idToken = await user.getIdToken();
      const response = await axios.post(`${BACKEND_URL}/api/trips`, tripDataToSend, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.data && (parseInt(response.status, 10) === 201 || parseInt(response.status, 10) === 200)) {
        setSavedTrips((prevTrips) => [...prevTrips, response.data]);
        setFilteredSavedTrips((prevTrips) => [...prevTrips, response.data]);
        toast.success('Trip saved successfully!');
      } else {
        console.error('Unexpected response structure:', response.data);
        toast.error('Failed to save trip. Unexpected response from server.');
      }
    } catch (err) {
      console.error('Error saving trip:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data && err.response.data.errors) {
        const messages = err.response.data.errors.map((error) => error.msg).join('\n');
        console.error('Validation Errors:', messages);
        toast.error(`Error: ${messages}`);
      } else if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else {
        toast.error('Failed to save trip.');
      }
    }
  };

  // Function to remove a saved trip via backend
  const removeTripFromDB = async (tripId) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to remove trips.');
      return;
    }

    try {
      const idToken = await user.getIdToken();
      await axios.delete(`${BACKEND_URL}/api/trips/${tripId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setSavedTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
      setFilteredSavedTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
      toast.success('Trip removed successfully!');
    } catch (err) {
      console.error(
        'Error removing trip:',
        err.response ? err.response.data : err.message
      );
      toast.error('Failed to remove trip.');
    }
  };

  // Function to get timezone of a location using Google Time Zone API
  const getTimezone = async (lat, lng, timestamp) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${GOOGLE_TIMEZONE_API_KEY}`
      );
      if (response.data.status === 'OK') {
        return response.data.timeZoneId;
      } else {
        console.error('Time Zone API Error:', response.data);
        throw new Error(
          `Failed to fetch timezone: ${response.data.status} - ${
            response.data.errorMessage || 'No error message provided.'
          }`
        );
      }
    } catch (error) {
      console.error('Error fetching timezone:', error);
      toast.error('Failed to fetch timezone information.');
      return null;
    }
  };

  // Handler for journey search form submission with timezone handling and end of day trips
  const handleJourneySearch = async (values) => {
    const { origin, destination, date, time } = values;

    // Combine date and time into a single Date object in local time
    const departureDateTime = new Date(`${date}T${time}:00`);

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

    try {
      // Geocode the origin to get latitude and longitude
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: origin }, async (results, status) => {
        if (status === 'OK' && results.length > 0) {
          const originLocation = results[0].geometry.location;
          let lat = originLocation.lat();
          let lng = originLocation.lng();

          // Get the timezone of the origin location
          let timestamp = Math.floor(departureDateTime.getTime() / 1000);
          const timeZoneId = await getTimezone(lat, lng, timestamp);
          if (!timeZoneId) {
            setJourneyLoading(false);
            return;
          }

          // Create a moment object in the origin's timezone
          const departureInOriginTZ = moment.tz(departureDateTime, timeZoneId);

          // Convert departure time to UTC
          const departureUTC = departureInOriginTZ.clone().utc();

          // Calculate end of the day in origin's timezone
          const endOfDayInOriginTZ = departureInOriginTZ.clone().endOf('day');
          const endOfDayUTC = endOfDayInOriginTZ.clone().utc();

          // Update the map center to the origin
          setMapCenter({ lat, lng });
          setMapZoom(12);

          // DirectionsService request with adjusted departure and arrival times
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route(
            {
              origin: origin,
              destination: destination,
              travelMode: window.google.maps.TravelMode.TRANSIT,
              transitOptions: {
                departureTime: departureUTC.toDate(),
                arrivalTime: endOfDayUTC.toDate(),
                modes: ['BUS'],
              },
              provideRouteAlternatives: true,
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                setDirectionsResponse(result);

                // Extract journey details
                const fetchedJourneys = result.routes.map((route) => {
                  const leg = route.legs[0];
                  const steps = leg.steps;
                  const transitSteps = steps.filter(
                    (step) =>
                      step.travel_mode === 'TRANSIT' &&
                      step.transit.line &&
                      step.transit.line.vehicle &&
                      step.transit.line.vehicle.type === 'BUS'
                  );
                  const transitStops = transitSteps.map(
                    (step) => step.transit.arrival_stop.name
                  );
                  const schedule = transitSteps.map((step) => ({
                    segment: step.transit.line.short_name || step.transit.line.name,
                    departure: formatTime(step.transit.departure_time.value, timeZoneId),
                    arrival: formatTime(step.transit.arrival_time.value, timeZoneId),
                  }));

                  // Calculate duration in seconds
                  let departure = leg.departure_time.value; 
                  let arrival = leg.arrival_time.value; 

                  console.log('Departure Timestamp:', departure, typeof departure);
                  console.log('Arrival Timestamp:', arrival, typeof arrival);

                  // Check if timestamps are in milliseconds and convert to seconds if necessary
                  if (departure > 1e12) { 
                    departure = Math.floor(departure / 1000);
                    console.warn('Converted departure from milliseconds to seconds:', departure);
                  }

                  if (arrival > 1e12) {
                    arrival = Math.floor(arrival / 1000);
                    console.warn('Converted arrival from milliseconds to seconds:', arrival);
                  }

                  const durationInSeconds = arrival - departure;

                  // Ensure duration is positive
                  if (durationInSeconds <= 0) {
                    console.error('Calculated duration is not positive:', durationInSeconds);
                    return null; 
                  }

                  // Generate ticketProviderUrl using FlixBus as an example
                  const ticketProviderUrl = generateTicketProviderUrl(
                    leg.start_address,
                    leg.end_address,
                    departure
                  );

                  return {
                    departureTime: departure, 
                    arrivalTime: arrival, 
                    origin: leg.start_address,
                    destination: leg.end_address,
                    transitStops: transitStops.length > 0 ? transitStops : ['No transit stops'],
                    schedule: schedule.length > 0 ? schedule : [{ segment: 'N/A', departure: 'N/A', arrival: 'N/A' }],
                    ticketProviderUrl: ticketProviderUrl,
                    type: 'bus',
                    duration: durationInSeconds, 
                    destinationLocation: {
                      lat: leg.end_location.lat(),
                      lng: leg.end_location.lng(),
                    },
                  };
                }).filter(journey => journey !== null); 

                // Filter journeys to include only those departing after the specified time
                const filteredJourneys = fetchedJourneys.filter((journey) => {
                  const journeyDeparture = moment.unix(journey.departureTime).tz(timeZoneId);
                  return journeyDeparture.isSameOrAfter(departureInOriginTZ);
                });

                if (filteredJourneys.length > 0) {
                  setJourneys(filteredJourneys);
                } else {
                  setJourneyError('No bus trips found for the given criteria.');
                  toast.info('No bus trips found for the given criteria.');
                }
              } else if (status === window.google.maps.DirectionsStatus.ZERO_RESULTS) {
                console.error('No bus routes found.');
                setJourneyError('No bus routes found for the specified journey.');
                toast.error('No bus routes found for the specified journey.');
              } else {
                console.error('Directions request failed due to ' + status);
                setJourneyError(
                  'Failed to fetch journey details. Please ensure your inputs are correct.'
                );
                toast.error('Failed to fetch journey details. Please ensure your inputs are correct.');
              }
              setJourneyLoading(false);
            }
          );
        } else {
          console.error('Geocoding failed:', status);
          setJourneyError('Location not found. Please try a different search.');
          setMapCenter({ lat: 40.7128, lng: -74.006 }); 
          setMapZoom(12);
          setMarkers([]);
          setIsLoading(false);
          setJourneyLoading(false);
          toast.error('Origin location not found.');
        }
      });
    } catch (error) {
      console.error('Error during journey search:', error);
      setJourneyError('An unexpected error occurred.');
      toast.error('An unexpected error occurred.');
      setJourneyLoading(false);
    }
  };

  // Function to generate Ticket Provider URL (using FlixBus as an example)
  const generateTicketProviderUrl = (origin, destination, departureUnix) => {
    const departureDate = moment.unix(departureUnix).format('YYYY-MM-DD');
    const baseUrl = 'https://www.flixbus.com/search-results'; 
    const params = new URLSearchParams({
      origin: origin,
      destination: destination,
      date: departureDate,
    });
    return `${baseUrl}?${params.toString()}`;
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
      // Filter favorites to only include 'bus_station'
      const busFavorites = response.data.favorites.filter(
        (fav) => fav.type === 'bus_station'
      );
      setFavorites(busFavorites);
    } catch (err) {
      console.error(
        'Error fetching favorites:',
        err.response ? err.response.data : err.message
      );
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
      // Only add if it's a bus_station
      if (response.data.favorite.type === 'bus_station') {
        setFavorites((prevFavorites) => [...prevFavorites, response.data.favorite]);
        toast.success('Favorite added successfully!');
      } else {
        toast.info('Only bus stations can be added to favorites.');
      }
    } catch (err) {
      console.error('Error adding favorite:', err.response ? err.response.data : err.message);
      
      if (err.response && err.response.data && err.response.data.errors) {
        console.log('Validation Errors:', err.response.data.errors); 
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
      setFavorites((prevFavorites) =>
        prevFavorites.filter((fav) => fav.id !== favoriteId)
      );
      toast.success('Favorite removed successfully!');
    } catch (err) {
      console.error(
        'Error removing favorite:',
        err.response ? err.response.data : err.message
      );
      toast.error('Failed to remove favorite.');
    }
  };

  // Function to fetch saved trips from backend
  const fetchSavedTrips = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await axios.get(`${BACKEND_URL}/api/trips`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        params: {
          limit: 1000, 
        },
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        // Convert departureTime and arrivalTime to UNIX timestamps if they are not already
        const processedTrips = response.data.map((trip) => ({
          ...trip,
          departureTime:
            typeof trip.departureTime === 'string' || trip.departureTime instanceof Date
              ? moment(trip.departureTime).unix()
              : trip.departureTime,
          arrivalTime:
            typeof trip.arrivalTime === 'string' || trip.arrivalTime instanceof Date
              ? moment(trip.arrivalTime).unix()
              : trip.arrivalTime,
          duration:
            typeof trip.duration === 'string' && /^\d+$/.test(trip.duration)
              ? parseInt(trip.duration, 10)
              : trip.duration,
        }));
        setSavedTrips(processedTrips);
        setFilteredSavedTrips(processedTrips);
      } else {
        console.error('Unexpected response structure:', response.data);
        setSavedTrips([]);
        setFilteredSavedTrips([]);
        toast.error('Unexpected response from server.');
      }
    } catch (err) {
      console.error(
        'Error fetching saved trips:',
        err.response ? err.response.data : err.message
      );
      toast.error('Failed to fetch saved trips.');
    }
  };

  const [selectedCategory, setSelectedCategory] = useState(null);

  // Corrected handleCategoryClick function
  const handleCategoryClick = (category) => {
    if (selectedCategory === category.name) {
      // Deselect if already selected
      setSelectedCategory(null);
      setMarkers([]);
      setError(null);
      return;
    }
    setSelectedCategory(category.name);
    setError(null);
    setIsLoading(true);
    setMarkers([]);
    setSelected(null);
    searchBusesByType(category.type);
  };

  // Corrected searchBusesByType function with proper namespace
  const searchBusesByType = (type) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      setError('Google Maps Places library is not loaded.');
      setIsLoading(false);
      return;
    }

    if (!mapRef.current) {
      setError('Map instance is not available.');
      setIsLoading(false);
      return;
    }

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: new window.google.maps.LatLng(mapCenter.lat, mapCenter.lng),
      radius: '10000', // 10 km radius
      type: type,
    };

    service.nearbySearch(request, (results, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        results
      ) {
        setMarkers(results);
        setIsLoading(false);
      } else {
        setError('No bus stations found for the selected category.');
        setMarkers([]);
        setIsLoading(false);
      }
    });
  };

  // Function to search buses by query
  const searchBusesByQuery = (query) => {
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
          type: ['bus_station', 'transit_station'],
          keyword: query,
        };

        service.nearbySearch(request, (results, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results
          ) {
            setMarkers(results);
            setIsLoading(false);
          } else {
            setError('No bus stations found for the specified search.');
            setMarkers([]);
            setIsLoading(false);
          }
        });
      } else {
        setError('Location not found. Please try a different search.');
        setMapCenter({ lat: 40.7128, lng: -74.006 }); 
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
    return null; 
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
          const mapSection = document.querySelector('.buses-component-map-section');
          if (mapSection) {
            mapSection.scrollIntoView({ behavior: 'smooth' });
          }
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
        url: 'https://maps.google.com/mapfiles/ms/icons/bus.png', 
        scaledSize: new window.google.maps.Size(40, 40), 
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
          console.warn(
            `Marker with ID ${marker.place_id} is missing geometry/location.`
          );
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
      setFavorites([]); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Fetch saved trips when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedTrips();
    } else {
      setSavedTrips([]); 
      setFilteredSavedTrips([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Function to handle viewing a journey on Google Maps externally
  const handleViewJourneyOnMap = (journey) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      journey.origin
    )}&destination=${encodeURIComponent(
      journey.destination
    )}&travelmode=transit`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  // Fetch user's current location on component mount
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
          console.error('Error fetching user location:', error);
          toast.info('Using default location (New York City).');
          // Defaults are already set
        }
      );
    } else {
      console.error('Geolocation not supported by this browser.');
      toast.info('Geolocation not supported. Using default location.');
      // Defaults are already set
    }
  }, []);

  if (loadError)
    return (
      <div className="buses-component-error">Error loading maps</div>
    );
  if (!isLoaded || authLoading)
    return (
      <div className="buses-component-spinner">
        <div className="spinner"></div> Loading Maps...
      </div>
    );

  return (
    <div className="buses-component">
      <ToastContainer />

      {/* Banner Section */}
      <div
        className="buses-component-banner"
        style={{
          backgroundImage: `url(${busBanner})`,
        }}
      >
        <div className="buses-component-banner-content">
          <h1>Discover Bus Stations</h1>
          <p>Find and explore bus stations near you</p>
          <button
            onClick={() =>
              document
                .querySelector('.buses-component-journey-search-section')
                .scrollIntoView({ behavior: 'smooth' })
            }
            className="buses-component-explore-button"
          >
            <FaBus /> Explore Now
          </button>
        </div>
      </div>

      {/* Journey Search Form - Redesigned */}
      <div className="buses-component-journey-search-section">
        <h2>Plan Your Journey</h2>
        <Formik
          initialValues={{
            origin: '',
            destination: '',
            date: '',
            time: '',
          }}
          validationSchema={Yup.object({
            origin: Yup.string().required('Origin is required'),
            destination: Yup.string().required('Destination is required'),
            date: Yup.string().required('Date is required'),
            time: Yup.string().required('Time is required'),
          })}
          onSubmit={handleJourneySearch}
        >
          {({ isSubmitting, handleChange, setFieldValue, values }) => (
            <Form className="buses-component-journey-form">
              <div className="buses-component-form-group">
                <label htmlFor="origin">Origin</label>
                <input
                  id="origin"
                  name="origin"
                  type="text"
                  placeholder="Enter origin station or city"
                  required
                  aria-label="Origin"
                  value={values.origin}
                  onChange={handleChange}
                  className="buses-component-input" 
                />
                <ErrorMessage name="origin">
                  {(msg) => <div className="error">{msg}</div>}
                </ErrorMessage>
              </div>
              <div className="buses-component-form-group">
                <label htmlFor="destination">Destination</label>
                <input
                  id="destination"
                  name="destination"
                  type="text"
                  placeholder="Enter destination station or city"
                  required
                  aria-label="Destination"
                  value={values.destination}
                  onChange={handleChange}
                  className="buses-component-input" 
                />
                <ErrorMessage name="destination">
                  {(msg) => <div className="error">{msg}</div>}
                </ErrorMessage>
              </div>
              <div className="buses-component-form-group">
                <label htmlFor="date">Date</label>
                <DatePicker
                  id="date"
                  name="date"
                  selected={values.date ? new Date(values.date) : null}
                  onChange={(date) =>
                    setFieldValue('date', date ? date.toISOString().split('T')[0] : '')
                  }
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select departure date"
                  className="buses-component-input" 
                  aria-label="Date of journey"
                />
                <ErrorMessage name="date">
                  {(msg) => <div className="error">{msg}</div>}
                </ErrorMessage>
              </div>
              <div className="buses-component-form-group">
                <label htmlFor="time">Time</label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  required
                  aria-label="Time of journey"
                  value={values.time}
                  onChange={handleChange}
                  className="buses-component-input" 
                />
                <ErrorMessage name="time">
                  {(msg) => <div className="error">{msg}</div>}
                </ErrorMessage>
              </div>
              <button
                type="submit"
                className="buses-component-search-journey-button"
                disabled={isSubmitting || journeyLoading}
              >
                {journeyLoading ? 'Searching...' : 'Search Journeys'}
              </button>
            </Form>
          )}
        </Formik>
        {journeyError && (
          <div className="buses-component-error-message">{journeyError}</div>
        )}
      </div>

      {/* Categories Section */}
      <div className="buses-component-categories-section">
        <h2>Explore by Type</h2>
        <div className="buses-component-categories-grid">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`buses-component-category-item ${
                selectedCategory === category.name ? 'selected' : ''
              }`}
              onClick={() => handleCategoryClick(category)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleCategoryClick(category);
              }}
            >
              <div className="buses-component-category-icon">
                {category.icon}
              </div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="buses-component-map-search-section">
        <div className="buses-component-map-search-bar">
          <input
            id="search-input"
            type="text"
            placeholder="Search for a city or station..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query) {
                  setIsLoading(true);
                  searchBusesByQuery(query);
                }
              }
            }}
            aria-label="Search for a city or station"
            className="search-input" 
          />
          <button
            onClick={() => {
              const query = document
                .getElementById('search-input')
                .value.trim();
              if (query) {
                setIsLoading(true);
                searchBusesByQuery(query);
              }
            }}
            aria-label="Search"
            className="buses-component-search-button"
          >
            Search
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="buses-component-map-section">
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
            <DirectionsRenderer directions={directionsResponse} />
          )}

          {/* Marker Clusterer */}
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
              <div className="buses-component-info-window">
                <h3>{selected.name}</h3>
                {selected.rating && <p>Rating: {selected.rating} ⭐</p>}
                {selected.formatted_address && (
                  <p>{selected.formatted_address}</p>
                )}
                {selected.photos && selected.photos.length > 0 ? (
                  <img
                    src={getPhotoUrl(selected.photos[0].photo_reference)}
                    alt={selected.name}
                    className="buses-component-info-window-image"
                    loading="lazy"
                  />
                ) : (
                  <p>No image available.</p>
                )}
                {selected.reviews && selected.reviews.length > 0 && (
                  <div className="buses-component-reviews">
                    <h4>User Reviews</h4>
                    {selected.reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="buses-component-review">
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
                    className="buses-component-google-maps-link"
                  >
                    Visit Website
                  </a>
                )}
                {selected.url && (
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buses-component-google-maps-link"
                  >
                    View on Google Maps
                  </a>
                )}
                <div className="buses-component-info-buttons">
                  <button
                    onClick={() => {
                      const favoriteData = {
                        type: 'bus_station', 
                        placeId: selected.place_id,
                        name: selected.name,
                        address:
                          selected.formatted_address || '',
                        rating: selected.rating || null,
                        photoReference:
                          selected.photos && selected.photos.length > 0
                            ? selected.photos[0].photo_reference
                            : null,
                      };
                      addFavoriteToDB(favoriteData);
                    }}
                    className="buses-component-favorite-button"
                  >
                    <FaBus /> Add to Favorites
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Dynamic Buses Section */}
      <div className="buses-component-dynamic-buses">
        <h2>{selectedCategory ? `${selectedCategory}` : 'Bus Stations'}</h2>
        {isLoading && (
          <div className="buses-component-spinner">
            <div className="spinner"></div> Loading bus stations...
          </div>
        )}
        {error && (
          <div className="buses-component-error-message">{error}</div>
        )}
        <div className="buses-component-saved-trips-grid">
          {markers.map((bus) => (
            <div key={bus.place_id} className="buses-component-item">
              <button
                onClick={() => fetchPlaceDetails(bus.place_id)}
                className="buses-component-image-button"
                aria-label={`View details for ${bus.name}`}
              >
                {bus.photos && bus.photos.length > 0 ? (
                  <img
                    src={getPhotoUrl(bus.photos[0].photo_reference)}
                    alt={bus.name}
                    className="buses-component-placeholder"
                    loading="lazy"
                  />
                ) : (
                  <p>No image available.</p>
                )}
              </button>
              <div className="buses-component-info">
                <h3>{bus.name}</h3>
                {bus.rating && <p>Rating: {bus.rating} ⭐</p>}
              </div>
              <div className="buses-component-actions">
                <button
                  onClick={() => fetchPlaceDetails(bus.place_id)}
                  className="buses-component-view-details-button"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    const favoriteData = {
                      type: 'bus_station', 
                      placeId: bus.place_id,
                      name: bus.name,
                      address:
                        bus.vicinity || bus.formatted_address || '',
                      rating: bus.rating || null,
                      photoReference:
                        bus.photos && bus.photos.length > 0
                          ? bus.photos[0].photo_reference
                          : null,
                    };
                    addFavoriteToDB(favoriteData);
                  }}
                  className="buses-component-favorite-button-small"
                >
                  <FaBus /> Add to Favorites
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Journeys Section */}
      <div className="buses-component-journeys-section">
        <h2>Your Journeys</h2>
        {journeyLoading && (
          <div className="buses-component-spinner">
            <div className="spinner"></div> Loading journeys...
          </div>
        )}
        {journeyError && (
          <div className="buses-component-error-message">{journeyError}</div>
        )}
        <div className="buses-component-saved-trips-grid">
          {journeys.map((journey, index) => (
            <div key={index} className="buses-component-trip-item">
              <h3>Journey {index + 1}</h3>
              <p>
                <strong>Departure:</strong> {formatTime(journey.departureTime, 'UTC')} from {journey.origin}
              </p>
              <p>
                <strong>Arrival:</strong> {formatTime(journey.arrivalTime, 'UTC')} at {journey.destination}
              </p>
              <p>
                <strong>Duration:</strong> {formatDuration(journey.duration)}
              </p>
              <div className="buses-component-transit-stops">
                <h4>Transit Stops:</h4>
                <ul>
                  {journey.transitStops.map((stop, idx) => (
                    <li key={idx}>{stop}</li>
                  ))}
                </ul>
              </div>
              <div className="buses-component-schedule">
                <h4>Schedule:</h4>
                <ul>
                  {journey.schedule.map((segment, idx) => (
                    <li key={idx}>
                      {segment.segment}: {segment.departure} - {segment.arrival}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Action Buttons */}
              <div className="buses-component-actions">
                <button
                  onClick={() => handleViewJourneyOnMap(journey)}
                  className="buses-component-view-directions-button"
                >
                  View on Map
                </button>
                {journey.ticketProviderUrl && (
                  <button
                    onClick={() =>
                      window.open(
                        journey.ticketProviderUrl,
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                    className="buses-component-buy-ticket-button"
                  >
                    Buy Ticket
                  </button>
                )}
                <button
                  onClick={() => saveTripToDB(journey)}
                  className="buses-component-save-trip-button"
                >
                  Save Trip
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Trips Section */}
      <div className="buses-component-saved-trips-section">
        <h2>Your Saved Trips</h2>
        <div className="buses-component-filter-form">
          <label htmlFor="filter-departure-date">Select Departure Date:</label>
          <DatePicker
            selected={filterDate}
            onChange={(date) => {
              setFilterDate(date);
              if (date) {
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                setFilteredSavedTrips(
                  savedTrips.filter((trip) => {
                    const tripDeparture = new Date(trip.departureTime * 1000); 
                    return (
                      tripDeparture >= startOfDay && tripDeparture <= endOfDay
                    );
                  })
                );
              } else {
                setFilteredSavedTrips(savedTrips);
              }
            }}
            dateFormat="yyyy-MM-dd"
            className="buses-component-datepicker"
            aria-label="Filter Departure Date"
          />
          <button
            onClick={() => {
              setFilterDate(null);
              setFilteredSavedTrips(savedTrips);
            }}
            className="buses-component-reset-filter-button"
          >
            Reset Filter
          </button>
        </div>
        {filteredSavedTrips.length > 0 ? (
          <>
            <div className="buses-component-saved-trips-grid">
              {filteredSavedTrips.map((trip) => (
                <div key={trip.id} className="buses-component-trip-item">
                  <h3>Trip to {trip.destination}</h3>
                  <p>
                    <strong>Departure:</strong> {formatTime(trip.departureTime, 'UTC')} 
                  </p>
                  <p>
                    <strong>Arrival:</strong> {formatTime(trip.arrivalTime, 'UTC')} 
                  </p>
                  <p>
                    <strong>Duration:</strong> {formatDuration(trip.duration)}
                  </p>
                  {trip.ticketProviderUrl && (
                    <p>
                      <strong>Ticket:</strong>{' '}
                      <a
                        href={trip.ticketProviderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Purchase Ticket
                      </a>
                    </p>
                  )}
                  {trip.transitStops && trip.transitStops.length > 0 && (
                    <div className="buses-component-transit-stops">
                      <h4>Transit Stops:</h4>
                      <ul>
                        {trip.transitStops.map((stop, idx) => (
                          <li key={idx}>{stop}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {trip.schedule && trip.schedule.length > 0 && (
                    <div className="buses-component-schedule">
                      <h4>Schedule:</h4>
                      <ul>
                        {trip.schedule.map((segment, idx) => (
                          <li key={idx}>
                            {segment.segment}: {segment.departure} - {segment.arrival}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Action Buttons */}
                  <div className="buses-component-actions">
                    <button
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                          trip.origin
                        )}&destination=${encodeURIComponent(
                          trip.destination
                        )}&travelmode=transit`;
                        window.open(mapsUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="buses-component-view-directions-button"
                    >
                      View Directions
                    </button>
                    {trip.ticketProviderUrl && (
                      <button
                        onClick={() =>
                          window.open(
                            trip.ticketProviderUrl,
                            '_blank',
                            'noopener,noreferrer'
                          )
                        }
                        className="buses-component-buy-ticket-button"
                      >
                        Buy Ticket
                      </button>
                    )}
                    <button
                      onClick={() => removeTripFromDB(trip.id)}
                      className="buses-component-delete-trip-button"
                    >
                      Delete Trip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>
            You have no saved trips{filterDate ? ' for the selected date' : ''}.
          </p>
        )}
      </div>

      {/* Favorites Section */}
      <div className="buses-component-favorites-section">
        <h2>Your Favorite Bus Stations</h2>
        {favorites.length > 0 ? (
          <div className="buses-component-favorites-grid">
            {favorites.map((fav) => (
              <div key={fav.id} className="buses-component-favorite-item">
                <button
                  onClick={() => fetchPlaceDetails(fav.placeId)}
                  className="buses-component-favorite-image-button"
                  aria-label={`View details for ${fav.name}`}
                >
                  {fav.photoReference ? (
                    <img
                      src={getPhotoUrl(fav.photoReference)}
                      alt={fav.name}
                      className="buses-component-placeholder"
                      loading="lazy"
                    />
                  ) : (
                    <p>No image available.</p>
                  )}
                </button>
                <div className="buses-component-favorite-info">
                  <h3>{fav.name}</h3>
                  {fav.rating && <p>Rating: {fav.rating} ⭐</p>}
                  <div className="buses-component-favorite-actions">
                    <button
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${fav.placeId}`;
                        window.open(mapsUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="buses-component-google-maps-button"
                    >
                    Google Maps
                    </button>
                    <button
                      onClick={() => removeFavoriteFromDB(fav.id)}
                      className="buses-component-delete-favorite-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You have no favorite bus stations yet.</p>
        )}
      </div>
    </div>
  );
};

export default Buses;
