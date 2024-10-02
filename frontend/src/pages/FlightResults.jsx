import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Pagination,
  Grid,
  Checkbox,
  FormControl,
  FormGroup,
  FormControlLabel,
  AppBar,
  Tabs,
  Tab,
  Drawer,
  IconButton,
  Toolbar,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import '../styles/FlightResults.css';

/* Define carrierInfo for mapping airline codes to airline names and logos */
const carrierInfo = {
  KL: {
    name: 'KLM Royal Dutch Airlines',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/KLM_logo.svg/1200px-KLM_logo.svg.png',
  },
  AI: {
    name: 'Air India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Air_India_Logo.png',
  },
  AF: {
    name: 'Air France',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/97/Air_France_Logo.svg/1200px-Air_France_Logo.svg.png',
  },
  // Add more airlines as needed
};

const FlightResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchParams, flightData } = location.state || {};
  const [currentFlights, setCurrentFlights] = useState(flightData || []);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!flightData);
  const [page, setPage] = useState(1);
  const flightsPerPage = searchParams?.max || 10;

  // Filter States
  const [stops, setStops] = useState({
    any: true,
    '1': false,
  });
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [flightTimes, setFlightTimes] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  });

  // Sidebar Drawer State for Mobile
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Extract unique airlines from flight data
  const availableAirlines = useMemo(() => {
    const airlines = new Set();
    currentFlights.forEach((flight) => {
      const carrierCode = flight.validatingAirlineCodes?.[0] || 'Unknown';
      airlines.add(carrierInfo[carrierCode]?.name || 'Unknown Airline');
    });
    return Array.from(airlines);
  }, [currentFlights]);

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/search-flights`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(searchParams),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'An error occurred while fetching flights.');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setCurrentFlights(data);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError('Failed to connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!flightData) {
      fetchFlights();
    }
  }, [flightData, searchParams]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBook = (details) => {
    navigate('/booking', { state: { flightDetails: details } });
  };

  const formatPrice = (price) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return 'N/A';
    }
    return numericPrice.toFixed(2);
  };

  const extractFlightDetails = (flight) => {
    if (
      !flight.itineraries ||
      !Array.isArray(flight.itineraries) ||
      flight.itineraries.length === 0 ||
      !flight.itineraries[0].segments ||
      !Array.isArray(flight.itineraries[0].segments) ||
      flight.itineraries[0].segments.length === 0
    ) {
      return {
        airlineName: 'Unknown Airline',
        airlineLogo: 'https://via.placeholder.com/50',
        flightNumber: 'N/A',
        origin: 'N/A',
        destination: 'N/A',
        departureTime: 'N/A',
        arrivalTime: 'N/A',
        price: flight.price || {},
      };
    }

    const segment = flight.itineraries[0].segments[0];
    const carrierCode = flight.validatingAirlineCodes?.[0] || segment.carrierCode || 'Unknown';
    const flightNumber = segment.number || 'N/A';
    const origin = segment.departure?.iataCode || 'N/A';
    const destination = segment.arrival?.iataCode || 'N/A';
    const departureTime = segment.departure?.at
      ? new Date(segment.departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'N/A';
    const arrivalTime = segment.arrival?.at
      ? new Date(segment.arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'N/A';
    const airlineName = carrierInfo[carrierCode]?.name || 'Unknown Airline';
    const airlineLogo = carrierInfo[carrierCode]?.logo || 'https://via.placeholder.com/50';

    return {
      airlineName,
      airlineLogo,
      flightNumber,
      origin,
      destination,
      departureTime,
      arrivalTime,
      price: flight.price,
    };
  };

  // Handle Filters
  const handleStopChange = (event) => {
    const { name, checked } = event.target;
    setStops((prev) => ({
      ...prev,
      [name]: checked,
    }));
    setPage(1);
  };

  const handleAirlineChange = (event) => {
    const { name, checked } = event.target;
    setSelectedAirlines((prev) =>
      checked ? [...prev, name] : prev.filter((airline) => airline !== name)
    );
    setPage(1);
  };

  const handleFlightTimeChange = (event) => {
    const { name, checked } = event.target;
    setFlightTimes((prev) => ({
      ...prev,
      [name]: checked,
    }));
    setPage(1);
  };

  // Apply Filters
  const filteredFlights = useMemo(() => {
    return currentFlights.filter((flight) => {
      const details = extractFlightDetails(flight);

      // Filter by Stops
      const totalStops = flight.itineraries.reduce((acc, itinerary) => acc + (itinerary.segments.length - 1), 0);
      if (stops['1'] && totalStops > 1) {
        return false;
      }
      if (!stops.any && !stops['1']) {
        return false;
      }

      // Filter by Airlines
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(details.airlineName)) {
        return false;
      }

      // Filter by Flight Times
      const departureHour = new Date(flight.itineraries[0].segments[0].departure.at).getHours();
      const isMorning = departureHour >= 6 && departureHour < 12;
      const isAfternoon = departureHour >= 12 && departureHour < 18;
      const isEvening = departureHour >= 18 || departureHour < 6;

      if (
        (flightTimes.morning && !isMorning) &&
        (flightTimes.afternoon && !isAfternoon) &&
        (flightTimes.evening && !isEvening)
      ) {
        return false;
      }

      return true;
    });
  }, [currentFlights, stops, selectedAirlines, flightTimes]);

  // Handle Sorting (Best, Cheapest, Fastest)
  const [sortValue, setSortValue] = useState('best');

  const handleSortChange = (event, newValue) => {
    setSortValue(newValue);
    setPage(1);
  };

  const sortedFlights = useMemo(() => {
    const flightsCopy = [...filteredFlights];
    switch (sortValue) {
      case 'cheapest':
        return flightsCopy.sort((a, b) => a.price.total - b.price.total);
      case 'fastest':
        // Assuming each flight has a duration field in minutes
        return flightsCopy.sort((a, b) => {
          const aDuration = a.itineraries[0].duration || 0;
          const bDuration = b.itineraries[0].duration || 0;
          return aDuration - bDuration;
        });
      case 'best':
      default:
        return flightsCopy; // Implement your own best sorting logic if available
    }
  }, [filteredFlights, sortValue]);

  // Update currentPageFlights based on sortedFlights
  const displayedFlights = useMemo(() => {
    const indexLast = page * flightsPerPage;
    const indexFirst = indexLast - flightsPerPage;
    return sortedFlights.slice(indexFirst, indexLast);
  }, [sortedFlights, page, flightsPerPage]);

  if (loading) {
    return (
      <div className="flight-results-loading">
        <Typography variant="h6" sx={{ mt: 4, color: '#333' }}>
          Loading flight results...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flight-results-error">
        <Typography variant="h6" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Go to Search
        </Button>
      </div>
    );
  }

  if (!currentFlights || currentFlights.length === 0) {
    return (
      <div className="flight-results-empty">
        <Typography variant="h6" sx={{ mb: 2 }}>
          No flights found for your search criteria.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flight-results-page">
      

      {/* Sidebar Drawer for Mobile */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { xs: 'block', sm: 'none' } }}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          {/* Filters Content */}
          <FormControl component="fieldset" variant="standard">
            <Typography variant="subtitle1">Stops</Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={stops.any}
                    onChange={handleStopChange}
                    name="any"
                  />
                }
                label="Any"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={stops['1']}
                    onChange={handleStopChange}
                    name="1"
                  />
                }
                label="1 Stop Max"
              />
            </FormGroup>
          </FormControl>

          <FormControl component="fieldset" variant="standard" sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Airlines</Typography>
            <FormGroup>
              {availableAirlines.map((airline) => (
                <FormControlLabel
                  key={airline}
                  control={
                    <Checkbox
                      checked={selectedAirlines.includes(airline)}
                      onChange={handleAirlineChange}
                      name={airline}
                    />
                  }
                  label={airline}
                />
              ))}
            </FormGroup>
          </FormControl>

          <FormControl component="fieldset" variant="standard" sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Flight Times</Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={flightTimes.morning}
                    onChange={handleFlightTimeChange}
                    name="morning"
                  />
                }
                label="Morning (6 AM - 12 PM)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={flightTimes.afternoon}
                    onChange={handleFlightTimeChange}
                    name="afternoon"
                  />
                }
                label="Afternoon (12 PM - 6 PM)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={flightTimes.evening}
                    onChange={handleFlightTimeChange}
                    name="evening"
                  />
                }
                label="Evening (6 PM - 12 AM)"
              />
            </FormGroup>
          </FormControl>
        </Box>
      </Drawer>

      {/* Sidebar for Desktop */}
      <div className="sidebar">
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        {/* Stops Filter */}
        <FormControl component="fieldset" variant="standard" sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Stops</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={stops.any}
                  onChange={handleStopChange}
                  name="any"
                />
              }
              label="Any"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={stops['1']}
                  onChange={handleStopChange}
                  name="1"
                />
              }
              label="1 Stop Max"
            />
          </FormGroup>
        </FormControl>

        {/* Airlines Filter */}
        <FormControl component="fieldset" variant="standard" sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Airlines</Typography>
          <FormGroup>
            {availableAirlines.map((airline) => (
              <FormControlLabel
                key={airline}
                control={
                  <Checkbox
                    checked={selectedAirlines.includes(airline)}
                    onChange={handleAirlineChange}
                    name={airline}
                  />
                }
                label={airline}
              />
            ))}
          </FormGroup>
        </FormControl>

        {/* Flight Times Filter */}
        <FormControl component="fieldset" variant="standard">
          <Typography variant="subtitle1">Flight Times</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={flightTimes.morning}
                  onChange={handleFlightTimeChange}
                  name="morning"
                />
              }
              label="Morning (6 AM - 12 PM)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={flightTimes.afternoon}
                  onChange={handleFlightTimeChange}
                  name="afternoon"
                />
              }
              label="Afternoon (12 PM - 6 PM)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={flightTimes.evening}
                  onChange={handleFlightTimeChange}
                  name="evening"
                />
              }
              label="Evening (6 PM - 12 AM)"
            />
          </FormGroup>
        </FormControl>
      </div>

      {/* Flight Results Container */}
      <div className="flight-results-container">
        {/* Sorting Tabs */}
        <AppBar position="static" color="transparent" elevation={0}>
          <Tabs
            value={sortValue}
            onChange={handleSortChange}
            indicatorColor="primary"
            textColor="inherit" // Changed to inherit to allow custom color
            variant="fullWidth"
            className="sorting-tabs"
          >
            <Tab label="Best" value="best" className="sorting-tab" />
            <Tab label="Cheapest" value="cheapest" className="sorting-tab" />
            <Tab label="Fastest" value="fastest" className="sorting-tab" />
          </Tabs>
        </AppBar>

        {/* Flight Results Grid */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {displayedFlights.map((flight, index) => {
            const details = extractFlightDetails(flight);
            return (
              <Grid item xs={12} key={flight.id || index}>
                <Box className="flight-card">
                  <Grid container alignItems="center">
                    {/* Airline and Flight Details */}
                    <Grid item xs={12} sm={8}>
                      <Box className="flight-details">
                        <img src={details.airlineLogo} alt={`${details.airlineName} logo`} />
                        <Box className="flight-times">
                          <Typography variant="subtitle1" className="airline-name">
                            {details.airlineName}
                          </Typography>
                          <Typography variant="body2">Flight: {details.flightNumber}</Typography>
                          <Typography variant="body2">
                            {details.origin} → {details.destination}
                          </Typography>
                          <Typography variant="body2">
                            Dep: {details.departureTime} | Arr: {details.arrivalTime}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Price and Book Now Button */}
                    <Grid item xs={12} sm={4}>
                      <Box className="price-details">
                        <Typography variant="h6" className="price">
                          {details.price?.currency && details.price.total
                            ? `${details.price.currency} ${formatPrice(details.price.total)}`
                            : 'Price Unavailable'}
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleBook(details)}
                          sx={{ mt: 1 }}
                        >
                          BOOK NOW
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Pagination */}
        {sortedFlights.length > flightsPerPage && (
          <Box className="pagination-container">
            <Pagination
              count={Math.ceil(sortedFlights.length / flightsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              siblingCount={1}
              boundaryCount={1}
              shape="rounded"
              size="large"
            />
          </Box>
        )}
      </div>
    </div>
  );
};

export default FlightResults;
