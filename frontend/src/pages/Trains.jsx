import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  GoogleMap,
  useLoadScript,
  MarkerClusterer,
  Marker,
  InfoWindow,
  TransitLayer,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import moment from 'moment-timezone';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrain } from 'react-icons/fa';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Container,
  Box,
  CircularProgress,
  IconButton,
  Paper,
} from '@mui/material';
import {
  FavoriteBorder,
  Delete,
  Directions,
  Search as SearchIcon,
} from '@mui/icons-material';

import '../styles/Trains.css'; 

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};
const categories = [
  { name: 'Train Stations', type: 'train_station', icon: <FaTrain size={30} /> },
];

const Trains = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [mapCenter, setMapCenter] = useState({ lat: 55.4038, lng: 10.4024 }); // Default to Odense center
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
  const mapSectionRef = useRef(null); 

  const onMapLoad = (map) => {
    mapRef.current = map;
    console.log('Map loaded:', map);
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

  // Helper function to convert UNIX timestamp if in milliseconds
  const convertToSeconds = (unix) => {
    if (unix > 1e12) { 
      return Math.floor(unix / 1000);
    }
    return unix;
  };

  // Helper function to format time as ISO 8601
  const formatTime = (unixTimestamp, timeZoneId) => {
    if (!unixTimestamp) return '';
    const timestamp = Number(unixTimestamp);
    if (isNaN(timestamp)) {
      console.warn('Invalid Unix Timestamp:', unixTimestamp);
      return 'Invalid Time';
    }
    return moment.unix(timestamp).tz(timeZoneId).format('YYYY-MM-DD HH:mm');
  };

  // Helper function to format duration
  const formatDuration = (durationInMinutes) => {
    if (!durationInMinutes || isNaN(durationInMinutes)) return 'N/A';
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Function to get timezone of a location using Google Time Zone API
  const getTimezone = async (lat, lng, timestamp) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${GOOGLE_TIMEZONE_API_KEY}`
      );
      console.log('Timezone API Response:', response.data);
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

  // Function to generate Ticket Provider URL
  const generateTicketProviderUrl = (origin, destination, departureUnix) => {
    const baseUrl = 'https://www.dsb.dk/en'; 
    const departureDateISO = moment.unix(departureUnix).utc().toISOString();
    const params = new URLSearchParams({
      origin: origin,
      destination: destination,
      departure: departureDateISO,
    });
    return `${baseUrl}?${params.toString()}`;
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

    if (tripData.ticket_provider_url && !isValidUrl(tripData.ticket_provider_url)) {
      toast.error('Invalid Ticket Provider URL.');
      return;
    }

    console.log('Attempting to save trip with data:', tripData); 

    try {
      // Convert departureTime and arrivalTime to ISO strings using moment and remove any leading '+'
      const departureISO = moment(tripData.departureTime).toISOString().replace(/^\+/, '');
      const arrivalISO = moment(tripData.arrivalTime).toISOString().replace(/^\+/, '');

      if (!moment(departureISO).isValid() || !moment(arrivalISO).isValid()) {
        throw new Error('Invalid departure or arrival date.');
      }

      const tripDataToSend = {
        ...tripData,
        departureTime: departureISO,
        arrivalTime: arrivalISO,
      };

      console.log('Trip Data to Send:', tripDataToSend); 

      const idToken = await user.getIdToken();
      const response = await axios.post(`${BACKEND_URL}/api/trips`, tripDataToSend, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Save Trip API Response:', response.data); 

      if (response.data && (response.status === 201 || response.status === 200)) {
        setSavedTrips((prevTrips) => [...prevTrips, response.data]);
        setFilteredSavedTrips((prevTrips) => [...prevTrips, response.data]);
        toast.success('Trip saved successfully!');
      } else {
        console.error('Unexpected response structure:', response);
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
      console.log(`Trip with ID ${tripId} removed.`);
      setSavedTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
      setFilteredSavedTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
      toast.success('Trip removed successfully!');
    } catch (err) {
      console.error('Error removing trip:', err.response ? err.response.data : err.message);
      toast.error('Failed to remove trip.');
    }
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
      console.log('Favorites API Response:', response.data);
      const trainFavorites = response.data.favorites.filter(
        (fav) => fav.type === 'train_station'
      );
      setFavorites(trainFavorites);
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
      const response = await axios.post(`${BACKEND_URL}/api/favorites`, favoriteData, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      console.log('Add Favorite API Response:', response.data);
      setFavorites((prevFavorites) => [...prevFavorites, response.data.favorite]);
      toast.success('Favorite added successfully!');
    } catch (err) {
      console.error('Error adding favorite:', err.response ? err.response.data : err.message);
      if (err.response && err.response.data && err.response.data.errors) {
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
      console.log(`Favorite with ID ${favoriteId} removed.`);
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== favoriteId));
      toast.success('Favorite removed successfully!');
    } catch (err) {
      console.error('Error removing favorite:', err.response ? err.response.data : err.message);
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
      });
      console.log('Saved Trips API Response:', response.data);
      if (Array.isArray(response.data)) {
        setSavedTrips(response.data);
        setFilteredSavedTrips(response.data);
      } else if (response.data && Array.isArray(response.data.trips)) {
        setSavedTrips(response.data.trips);
        setFilteredSavedTrips(response.data.trips);
      } else {
        console.error('Unexpected response structure:', response.data);
        setSavedTrips([]);
        setFilteredSavedTrips([]);
        toast.error('Unexpected response from server.');
      }
    } catch (err) {
      console.error('Error fetching saved trips:', err.response ? err.response.data : err.message);
      toast.error('Failed to fetch saved trips.');
    }
  };

  // Handler for journey search form submission with timezone handling
  const handleJourneySearch = async (values) => {
    const { origin, destination, date, time } = values;

    console.log('Formik Values:', values); 

    const departureDateTime = new Date(`${date}T${time}:00`);

    console.log('Constructed departureDateTime:', departureDateTime); 

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
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: origin }, async (results, status) => {
        console.log('Geocode Results for Journey:', results);
        console.log('Geocode Status for Journey:', status);
        if (status === 'OK' && results.length > 0) {
          const originLocation = results[0].geometry.location;
          let lat = originLocation.lat();
          let lng = originLocation.lng();
          let timestamp = Math.floor(departureDateTime.getTime() / 1000);
          const timeZoneId = await getTimezone(lat, lng, timestamp);
          if (!timeZoneId) {
            setJourneyLoading(false);
            return;
          }

          const departureInOriginTZ = moment.tz(departureDateTime, timeZoneId);

          const departureISO = departureInOriginTZ.toISOString().replace(/^\+/, '');

          setMapCenter({ lat, lng });
          setMapZoom(12);

          // DirectionsService request with corrected transitOptions
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route(
            {
              origin: origin,
              destination: destination,
              travelMode: window.google.maps.TravelMode.TRANSIT,
              transitOptions: {
                departureTime: departureInOriginTZ.toDate(), 
                modes: ['TRAIN'],
              },
              provideRouteAlternatives: true, 
            },
            (result, status) => {
              console.log('Directions Service Result:', result);
              console.log('Directions Service Status:', status);
              if (status === window.google.maps.DirectionsStatus.OK) {
                setDirectionsResponse(result);

                // Extract journey details
                const fetchedJourneys = result.routes.map((route, routeIndex) => {
                  const leg = route.legs[0];
                  const steps = leg.steps;
                  const transitSteps = steps.filter(
                    (step) => step.travel_mode === 'TRANSIT' && step.transit.line
                  );

                  const transitLines = transitSteps.map(
                    (step) => step.transit.line.name || 'Unknown Line'
                  );
                  const transitStops = transitSteps.map(
                    (step) =>
                      step.transit.line.short_name || step.transit.line.name || 'Unknown Stop'
                  );

                  const schedule = transitSteps
                    .map((step, idx) => ({
                      segment: step.transit.line.name || `Segment ${idx + 1}`,
                      departure: step.transit.departure_time
                        ? formatTime(step.transit.departure_time.value, timeZoneId)
                        : 'N/A',
                      arrival: step.transit.arrival_time
                        ? formatTime(step.transit.arrival_time.value, timeZoneId)
                        : 'N/A',
                    }))
                    .filter((seg) => seg.departure !== 'N/A' && seg.arrival !== 'N/A'); 

                  // Correct Timestamp Conversion
                  let departureUnix = Number(leg.departure_time.value);
                  let arrivalUnix = Number(leg.arrival_time.value);

                  console.log('Departure Unix:', departureUnix);
                  console.log('Arrival Unix:', arrivalUnix);

                  // Convert to seconds if in milliseconds
                  departureUnix = convertToSeconds(departureUnix);
                  arrivalUnix = convertToSeconds(arrivalUnix);

                  const departure = moment.unix(departureUnix).utc();
                  const arrival = moment.unix(arrivalUnix).utc();

                  // Validate Date Objects
                  if (!departure.isValid() || !arrival.isValid()) {
                    console.error('Invalid departure or arrival date:', departure, arrival);
                    toast.error('Invalid departure or arrival date.');
                    return null; 
                  }

                  // Calculate duration in minutes
                  const durationInMinutes = Math.round(
                    (arrival - departure) / 60000
                  ); 

                  console.log('Departure ISO:', departure.toISOString());
                  console.log('Arrival ISO:', arrival.toISOString());

                  // Generate ticketProviderUrl
                  const ticketProviderUrl = generateTicketProviderUrl(
                    leg.start_address,
                    leg.end_address,
                    departureUnix
                  );

                  return {
                    departureTime: departure.toISOString(), 
                    arrivalTime: arrival.toISOString(),
                    origin: leg.start_address,
                    destination: leg.end_address,
                    transit_stops: transitStops,
                    transit_lines: transitLines,
                    schedule: schedule,
                    ticket_provider_url: ticketProviderUrl,
                    type: 'train',
                    duration: durationInMinutes,
                  };
                }).filter((journey) => journey !== null); 

                
                setJourneys(fetchedJourneys);
              } else {
                console.error('Directions request failed due to ' + status);
                setJourneyError(
                  'Failed to fetch journey details. Please ensure your inputs are correct.'
                );
                toast.error(
                  'Failed to fetch journey details. Please ensure your inputs are correct.'
                );
              }
              setJourneyLoading(false);
            }
          );
        } else {
          console.error('Geocoding failed:', status);
          setJourneyError('Location not found. Please try a different search.');
          setMapCenter({ lat: 55.4038, lng: 10.4024 }); 
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

  // Handler for viewing a journey on Google Maps externally
  const handleViewJourneyOnMap = (journey) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      journey.origin
    )}&destination=${encodeURIComponent(
      journey.destination
    )}&travelmode=transit`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  // Function to fetch detailed place information
  const fetchPlaceDetails = (placeId) => {
    console.log('Fetching details for Place ID:', placeId);
    if (!window.google || !mapRef.current) {
      console.error('Google Maps is not loaded properly or mapRef is undefined.');
      return;
    }

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.getDetails(
      {
        placeId: placeId,
        fields: [
          'place_id', // Added place_id to ensure it's available
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
        console.log('Place Details:', place);
        console.log('Place Details Status:', status);
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry &&
          place.geometry.location
        ) {
          setSelected(place);
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

  // Marker Handling
  const addAdvancedMarker = (position, place) => {
    if (!window.google || !mapRef.current) return;

    const marker = new window.google.maps.Marker({
      map: mapRef.current,
      position,
      title: place.name,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/train.png',
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

    
    return () => {
      if (mapRef.current && mapRef.current.markers) {
        mapRef.current.markers.forEach((marker) => marker.setMap(null));
        mapRef.current.markers = [];
      }
    };
    
  }, [isLoaded, markers]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    if (selectedCategory === category.name) {
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
      location: new window.google.maps.LatLng(mapCenter.lat, mapCenter.lng),
      radius: '10000',
      type: [type],
    };

    service.nearbySearch(request, (results, status) => {
      console.log('Nearby Search Results:', results);
      console.log('Nearby Search Status:', status);
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

  // Function to search trains by query
  const searchTrainsByQuery = (query) => {
    if (!window.google) {
      setError('Google Maps is not loaded properly.');
      setIsLoading(false);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: query }, (results, status) => {
      console.log('Geocode Results:', results);
      console.log('Geocode Status:', status);
      if (status === 'OK' && results.length > 0) {
        const location = results[0].geometry.location;
        setMapCenter({ lat: location.lat(), lng: location.lng() });
        setMapZoom(12);
        setSelectedCategory(null);

        const service = new window.google.maps.places.PlacesService(mapRef.current);
        const request = {
          location: location,
          radius: '10000',
          type: ['train_station'],
          keyword: query,
        };

        service.nearbySearch(request, (results, status) => {
          console.log('Nearby Search by Query Results:', results);
          console.log('Nearby Search by Query Status:', status);
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
        setMapCenter({ lat: 55.4038, lng: 10.4024 }); 
        setMapZoom(12);
        setMarkers([]);
        setIsLoading(false);
      }
    });
  };

  // Function to get photo URL
  const getPhotoUrl = (photoReference) => {
    if (photoReference) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
    }
    return `https://source.unsplash.com/collection/190727/400x300?train`;
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]); 
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedTrips();
    } else {
      setSavedTrips([]); 
      setFilteredSavedTrips([]);
    }
  }, [isAuthenticated, user]);

  const handleViewDetails = (placeId) => {
    fetchPlaceDetails(placeId);
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loadError)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error" variant="h5">
          Error loading maps
        </Typography>
      </Box>
    );
  if (!isLoaded || authLoading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" flexDirection="column">
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Maps...
        </Typography>
      </Box>
    );

  return (
    <Box className="trains-component">
      <ToastContainer />

      {/* Banner Section */}
      <div className="trains-component-banner">
        <div className="trains-component-banner-content">
          <h1>Discover Train Stations</h1>
          <p>Find and explore train stations near you</p>
          <button
            className="trains-component-explore-button"
            onClick={() => document.getElementById('origin').focus()}
            aria-label="Explore Train Stations"
          >
            <FaTrain /> Explore Now
          </button>
        </div>
      </div>

      {/* Journey Search Form */}
      <div className="trains-component-map-search-section">
        <div className="trains-component-map-search-bar">
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
              date: Yup.date()
                .required('Date is required')
                .min(moment().startOf('day'), 'Date cannot be in the past'),
              time: Yup.string().required('Time is required'),
            })}
            onSubmit={handleJourneySearch}
          >
            {({ isSubmitting, handleChange, values, touched, errors }) => (
              <Form className="trains-component-journey-form">
                <div className="trains-component-form-group">
                  <label htmlFor="origin">Origin</label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    value={values.origin}
                    onChange={handleChange}
                    placeholder="Enter origin"
                    required
                  />
                  {touched.origin && errors.origin && (
                    <div className="error-message">{errors.origin}</div>
                  )}
                </div>

                <div className="trains-component-form-group">
                  <label htmlFor="destination">Destination</label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={values.destination}
                    onChange={handleChange}
                    placeholder="Enter destination"
                    required
                  />
                  {touched.destination && errors.destination && (
                    <div className="error-message">{errors.destination}</div>
                  )}
                </div>

                <div className="trains-component-form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={values.date}
                    onChange={handleChange}
                    required
                  />
                  {touched.date && errors.date && (
                    <div className="error-message">{errors.date}</div>
                  )}
                </div>

                <div className="trains-component-form-group">
                  <label htmlFor="time">Time</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={values.time}
                    onChange={handleChange}
                    required
                  />
                  {touched.time && errors.time && (
                    <div className="error-message">{errors.time}</div>
                  )}
                </div>

                <div className="trains-component-form-group">
                  <button
                    type="submit"
                    className="trains-component-search-journey-button"
                    disabled={isSubmitting || journeyLoading}
                  >
                    {journeyLoading ? 'Searching...' : 'Search Journeys'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      {journeyError && <div className="trains-component-error-message">{journeyError}</div>}

      {/* Categories Section */}
      <div className="trains-component-categories-section">
        <h2>Explore by Type</h2>
        <div className="trains-component-categories-grid">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`trains-component-category-item ${
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
              <div className="trains-component-category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar Section */}
      <Container className="trains-component-map-search-section">
        <Paper
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            const query = e.currentTarget.search.value.trim();
            if (query) {
              setIsLoading(true);
              searchTrainsByQuery(query);
            }
          }}
          className="trains-component-map-search-bar"
          aria-label="Search Train Stations"
        >
          <IconButton className="search-icon" aria-label="search">
            <SearchIcon />
          </IconButton>
          <input
            type="text"
            id="search"
            name="search"
            placeholder="Search for a city or station..."
            className="search-input"
            required
          />
          <button type="submit" className="trains-component-search-button">
            Search
          </button>
        </Paper>
      </Container>

      {/* Map Section */}
      <div className="trains-component-map-section" ref={mapSectionRef}>
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
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}

          {/* Marker Clusterer */}
          <MarkerClusterer>
            {(clusterer) =>
              markers.map((marker) => (
                <Marker
                  key={marker.place_id}
                  position={{
                    lat: marker.geometry.location.lat(),
                    lng: marker.geometry.location.lng(),
                  }}
                  clusterer={clusterer}
                  onClick={() => fetchPlaceDetails(marker.place_id)}
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
              <div className="trains-component-info-window">
                <h3>{selected.name}</h3>
                {selected.rating && <p>Rating: {selected.rating} ⭐</p>}
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
                    src={`https://source.unsplash.com/collection/190727/400x300?train`}
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
                        <strong>{review.author_name}</strong>
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
                    className="trains-component-website-link"
                  >
                    Visit Website
                  </a>
                )}
                {selected.url && (
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="trains-component-google-maps-link"
                  >
                    View on Google Maps
                  </a>
                )}
                <div className="trains-component-info-buttons">
                  <button
                    className="trains-component-favorite-button"
                    onClick={() => {
                      const favoriteData = {
                        type: 'train_station',
                        placeId: selected.place_id, // Ensure place_id is correctly passed
                        name: selected.name,
                        address: selected.formatted_address || '',
                        rating: selected.rating || null,
                        photoReference:
                          selected.photos && selected.photos.length > 0
                            ? selected.photos[0].photo_reference
                            : null,
                      };
                      addFavoriteToDB(favoriteData);
                    }}
                  >
                    <FavoriteBorder /> Add to Favorites
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Conditionally Render Train Stations Section */}
      {markers.length > 0 && (
        <div className="trains-component-dynamic-trains">
          <Container>
            <h2>Train Stations</h2>
            {isLoading && (
              <div className="trains-component-spinner">
                <CircularProgress />
                <p>Loading train stations...</p>
              </div>
            )}
            {error && <div className="trains-component-error-message">{error}</div>}
            <Grid container spacing={4}>
              {markers.map((train) => (
                <Grid item xs={12} sm={6} md={4} key={train.place_id}>
                  <Card className="trains-component-item">
                    <button
                      className="trains-component-image-button"
                      onClick={() => handleViewDetails(train.place_id)}
                      aria-label={`View details for ${train.name}`}
                    >
                      <img
                        src={
                          train.photos && train.photos.length > 0
                            ? getPhotoUrl(train.photos[0].photo_reference)
                            : getPhotoUrl(null)
                        }
                        alt={train.name}
                        className="trains-component-placeholder"
                        loading="lazy"
                      />
                    </button>
                    <div className="trains-component-info">
                      <h3>{train.name}</h3>
                      {train.rating && <p>Rating: {train.rating} ⭐</p>}
                    </div>
                    <div className="trains-component-actions">
                      <button
                        className="trains-component-view-details-button"
                        onClick={() => handleViewDetails(train.place_id)}
                        aria-label={`View details for ${train.name}`}
                      >
                        View Details
                      </button>
                      <button
                        className="trains-component-favorite-button-small"
                        onClick={() => {
                          const favoriteData = {
                            type: 'train_station',
                            placeId: train.place_id,
                            name: train.name,
                            address: train.vicinity || train.formatted_address || '',
                            rating: train.rating || null,
                            photoReference:
                              train.photos && train.photos.length > 0
                                ? train.photos[0].photo_reference
                                : null,
                          };
                          addFavoriteToDB(favoriteData);
                        }}
                        aria-label={`Add ${train.name} to favorites`}
                      >
                        <FavoriteBorder /> Favorite
                      </button>
                    </div>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </div>
      )}

      {/* Conditionally Render Your Journeys Section */}
      {journeys.length > 0 && (
        <div className="trains-component-journeys-section">
          <Container>
            <h2>Your Journeys</h2>
            {journeyLoading && (
              <div className="trains-component-spinner">
                <CircularProgress />
                <p>Loading journeys...</p>
              </div>
            )}
            {journeyError && <div className="trains-component-error-message">{journeyError}</div>}
            <Grid container spacing={4}>
              {journeys.map((journey, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card className="trains-component-journey-item">
                    <CardContent>
                      <h3>Journey {index + 1}</h3>
                      <p>
                        <strong>Departure:</strong> {moment(journey.departureTime).format('YYYY-MM-DD HH:mm')} from {journey.origin}
                      </p>
                      <p>
                        <strong>Arrival:</strong> {moment(journey.arrivalTime).format('YYYY-MM-DD HH:mm')} at {journey.destination}
                      </p>
                      <p>
                        <strong>Duration:</strong> {formatDuration(journey.duration)}
                      </p>
                      {journey.transit_stops && journey.transit_stops.length > 0 && (
                        <div className="trains-component-transit-stops">
                          <strong>Transit Stops:</strong>
                          <ul>
                            {journey.transit_stops.map((stop, idx) => (
                              <li key={idx}>{stop}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {journey.schedule && journey.schedule.length > 0 && (
                        <div className="trains-component-schedule">
                          <strong>Schedule:</strong>
                          <ul>
                            {journey.schedule.map((segment, idx) => (
                              <li key={idx}>
                                {segment.segment}: {segment.departure} - {segment.arrival}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                    <CardActions>
                      <button
                        className="trains-component-view-details-button"
                        onClick={() => {
                          const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                            journey.origin
                          )}&destination=${encodeURIComponent(
                            journey.destination
                          )}&travelmode=transit`;
                          window.open(mapsUrl, '_blank', 'noopener,noreferrer');
                        }}
                        aria-label={`View directions for Journey ${index + 1}`}
                      >
                        <Directions /> View Directions
                      </button>
                      {journey.ticket_provider_url && (
                        <button
                          className="trains-component-buy-ticket-button"
                          onClick={() =>
                            window.open(journey.ticket_provider_url, '_blank', 'noopener,noreferrer')
                          }
                          aria-label={`Buy ticket for Journey ${index + 1}`}
                        >
                          Buy Ticket
                        </button>
                      )}
                      <button
                        className="trains-component-save-trip-button"
                        onClick={() => saveTripToDB(journey)}
                        aria-label={`Save Journey ${index + 1}`}
                      >
                        Save Trip
                      </button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </div>
      )}

      {/* Saved Trips Section */}
      <div className="trains-component-saved-trips-section">
        <Container>
          <h2>Your Saved Trips</h2>
          <div className="trains-component-saved-trips-filter">
            <span>Filter by Departure Date:</span>
            <input
              type="date"
              value={filterDate ? moment(filterDate).format('YYYY-MM-DD') : ''}
              onChange={(e) => {
                const selectedDate = e.target.value ? new Date(e.target.value) : null;
                setFilterDate(selectedDate);
                if (selectedDate) {
                  const startOfDay = new Date(selectedDate);
                  startOfDay.setHours(0, 0, 0, 0);
                  const endOfDay = new Date(selectedDate);
                  endOfDay.setHours(23, 59, 59, 999);
                  setFilteredSavedTrips(
                    savedTrips.filter((trip) => {
                      const tripDeparture = moment.unix(trip.departureTime).toDate();
                      return tripDeparture >= startOfDay && tripDeparture <= endOfDay;
                    })
                  );
                } else {
                  setFilteredSavedTrips(savedTrips);
                }
              }}
              aria-label="Filter saved trips by departure date"
            />
            <button
              className="trains-component-clear-filter-button"
              onClick={() => {
                setFilterDate(null);
                setFilteredSavedTrips(savedTrips);
              }}
              aria-label="Clear saved trips filter"
            >
              Clear Filter
            </button>
          </div>
          {filteredSavedTrips.length > 0 ? (
            <Grid container spacing={4}>
              {filteredSavedTrips.map((trip, index) => (
                <Grid item xs={12} md={6} key={trip.id || index}>
                  <Card className="trains-component-saved-trip-item">
                    <CardContent>
                      <h3>Train Trip</h3>
                      <p>
                        <strong>From:</strong> {trip.origin}
                      </p>
                      <p>
                        <strong>To:</strong> {trip.destination}
                      </p>
                      <p>
                        <strong>Departure:</strong> {moment.unix(trip.departureTime).format('YYYY-MM-DD HH:mm')}
                      </p>
                      <p>
                        <strong>Arrival:</strong> {moment.unix(trip.arrivalTime).format('YYYY-MM-DD HH:mm')}
                      </p>
                      <p>
                        <strong>Duration:</strong> {formatDuration(trip.duration)}
                      </p>
                      {trip.ticket_provider_url && (
                        <p>
                          <strong>Ticket:</strong>{' '}
                          <a href={trip.ticket_provider_url} target="_blank" rel="noopener noreferrer">
                            Purchase Ticket
                          </a>
                        </p>
                      )}
                      {trip.transit_stops && trip.transit_stops.length > 0 && (
                        <div className="trains-component-transit-stops">
                          <strong>Transit Stops:</strong>
                          <ul>
                            {trip.transit_stops.map((stop, idx) => (
                              <li key={idx}>{stop}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {trip.schedule && trip.schedule.length > 0 && (
                        <div className="trains-component-schedule">
                          <strong>Schedule:</strong>
                          <ul>
                            {trip.schedule.map((segment, idx) => (
                              <li key={idx}>
                                {segment.segment}: {segment.departure} - {segment.arrival}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                    <CardActions>
                      <button
                        className="trains-component-view-details-button"
                        onClick={() => {
                          const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                            trip.origin
                          )}&destination=${encodeURIComponent(
                            trip.destination
                          )}&travelmode=transit`;
                          window.open(mapsUrl, '_blank', 'noopener,noreferrer');
                        }}
                        aria-label={`View directions for saved trip ${index + 1}`}
                      >
                        <Directions /> View Directions
                      </button>
                      {trip.ticket_provider_url && (
                        <button
                          className="trains-component-buy-ticket-button"
                          onClick={() =>
                            window.open(trip.ticket_provider_url, '_blank', 'noopener,noreferrer')
                          }
                          aria-label={`Buy ticket for saved trip ${index + 1}`}
                        >
                          Buy Ticket
                        </button>
                      )}
                      <button
                        className="trains-component-delete-trip-button"
                        onClick={() => removeTripFromDB(trip.id)}
                        aria-label={`Remove saved trip ${index + 1}`}
                      >
                        <Delete /> Remove
                      </button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <p className="no-saved-trips-message">
              You have no saved trips{filterDate ? ' for the selected date' : ''}.
            </p>
          )}
        </Container>
      </div>

      {/* Favorites Section */}
      <div className="trains-component-favorites-section">
        <Container>
          <h2>Your Favorite Train Stations</h2>
          {favorites.filter(fav => fav.type === 'train_station').length > 0 ? (
            <Grid container spacing={4} className="trains-component-favorites-grid">
              {favorites.filter(fav => fav.type === 'train_station').map((fav) => (
                <Grid item xs={12} sm={6} md={4} key={fav.id}>
                  <Card className="trains-component-favorite-item">
                    <button
                      className="trains-component-favorite-image-button"
                      onClick={() => handleViewDetails(fav.placeId)}
                      aria-label={`View details for favorite station ${fav.name}`}
                    >
                      {fav.photoReference ? (
                        <img
                          src={getPhotoUrl(fav.photoReference)}
                          alt={fav.name}
                          className="trains-component-placeholder"
                          loading="lazy"
                        />
                      ) : (
                        <p>No image available.</p>
                      )}
                    </button>
                    <div className="trains-component-favorite-info">
                      <h3>{fav.name}</h3>
                      {fav.rating && <p>Rating: {fav.rating} ⭐</p>}
                    </div>
                    <div className="trains-component-favorite-actions">
                      <button
                        className="trains-component-google-maps-button"
                        onClick={() => {
                          const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${fav.placeId}`;
                          window.open(mapsUrl, '_blank', 'noopener,noreferrer');
                        }}
                        aria-label={`View ${fav.name} on Google Maps`}
                      >
                        View on Google Maps
                      </button>
                      <button
                        className="trains-component-delete-favorite-button"
                        onClick={() => removeFavoriteFromDB(fav.id)}
                        aria-label={`Remove favorite station ${fav.name}`}
                      >
                        <Delete /> Remove
                      </button>
                    </div>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <p className="no-favorites-message">
              You have no favorite train stations yet.
            </p>
          )}
        </Container>
      </div>
    </Box>
  );
};

export default Trains;
