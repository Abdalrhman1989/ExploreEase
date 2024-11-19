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
  Box,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StopIcon from '@mui/icons-material/Stop';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CloseIcon from '@mui/icons-material/Close';
import carrierMapping from '../utils/airlineMapping';
import '../styles/FlightResults.css';

const FlightResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchParams, flightData } = location.state || {};

  const [currentFlights, setCurrentFlights] = useState(
    Array.isArray(flightData?.data) ? flightData.data : []
  );
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!flightData);
  const [page, setPage] = useState(1);
  const flightsPerPage = 10;

  // Filter States
  const [stops, setStops] = useState({
    any: true,
    '0': false,
    '1': false,
    '2': false,
  });
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [flightTimes, setFlightTimes] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  });
  const [priceRange, setPriceRange] = useState([0, 2000]);

  // Confirmation Dialog States
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Extract unique airlines from flight data
  const availableAirlines = useMemo(() => {
    const airlines = new Set();
    currentFlights.forEach((flight) => {
      if (Array.isArray(flight.validatingAirlineCodes)) {
        flight.validatingAirlineCodes.forEach((code) => {
          const airlineName = carrierMapping[code]?.name || code;
          airlines.add(airlineName);
        });
      }
    });
    return Array.from(airlines).sort();
  }, [currentFlights]);

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/flights/search-flights`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchParams),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'An error occurred while fetching flights.');
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (data && data.success && Array.isArray(data.data)) {
          setCurrentFlights(data.data);
        } else {
          setError('Unexpected response format from server.');
        }
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

  const handleBook = (flight) => {
    handleOpenDialog(flight);
  };

  const formatPrice = (price) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return 'N/A';
    }
    return numericPrice.toFixed(2);
  };

  const parseDuration = (duration) => {
    const matches = duration.match(/P(?:([0-9]+)D)?T(?:([0-9]+)H)?(?:([0-9]+)M)?/);
    if (!matches) return 0;
    const days = parseInt(matches[1] || 0, 10);
    const hours = parseInt(matches[2] || 0, 10);
    const minutes = parseInt(matches[3] || 0, 10);
    return days * 24 * 60 + hours * 60 + minutes;
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
        airlineLogo: 'https://via.placeholder.com/100?text=No+Logo',
        flightNumber: 'N/A',
        fullRoute: 'N/A',
        departureTime: 'N/A',
        arrivalTime: 'N/A',
        price: flight.price || {},
        totalDuration: 0,
        numberOfStops: 0,
        flight,
      };
    }

    const segments = flight.itineraries[0].segments;
    const carrierCode = segments[0].carrierCode || 'Unknown';

    const flightNumbers = segments.map((segment) => segment.number).filter(Boolean).join(', ') || 'N/A';
    const origin = segments[0].departure?.iataCode || 'N/A';
    const finalDestination = segments[segments.length - 1].arrival?.iataCode || 'N/A';
    const departureTime = segments[0].departure?.at
      ? new Date(segments[0].departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'N/A';
    const arrivalTime = segments[segments.length - 1].arrival?.at
      ? new Date(segments[segments.length - 1].arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'N/A';

    const airlineName = carrierMapping[carrierCode]?.name || 'Unknown Airline';
    const airlineLogo = carrierMapping[carrierCode]?.logo || 'https://via.placeholder.com/100?text=No+Logo';

    const totalDuration = flight.itineraries.reduce((acc, itinerary) => {
      return acc + parseDuration(itinerary.duration);
    }, 0);

    const numberOfStops = flight.itineraries.reduce((acc, itinerary) => {
      return acc + (itinerary.segments.length - 1);
    }, 0);

    const fullRoute = segments.map((segment) => `${segment.departure.iataCode} → ${segment.arrival.iataCode}`).join(' | ');

    return {
      airlineName,
      airlineLogo,
      flightNumber: flightNumbers,
      fullRoute,
      departureTime,
      arrivalTime,
      price: flight.price,
      totalDuration,
      numberOfStops,
      flight,
    };
  };

  // Apply Filters
  const filteredFlights = useMemo(() => {
    return currentFlights.filter((flight) => {
      const details = extractFlightDetails(flight);

      // Filter by Stops
      if (stops['0'] && details.numberOfStops !== 0) {
        return false;
      }
      if (stops['1'] && details.numberOfStops !== 1) {
        return false;
      }
      if (stops['2'] && details.numberOfStops < 2) {
        return false;
      }
      if (!stops.any && !stops['0'] && !stops['1'] && !stops['2']) {
        return false;
      }

      // Filter by Airlines
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(details.airlineName)) {
        return false;
      }

      // Filter by Flight Times
      const departureDate = flight.itineraries[0].segments[0].departure.at;
      const departureHour = new Date(departureDate).getHours();
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

      // Filter by Price Range
      if (details.price.total < priceRange[0] || details.price.total > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [currentFlights, stops, selectedAirlines, flightTimes, priceRange]);

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
        return flightsCopy.sort((a, b) => {
          const aDuration = a.itineraries.reduce(
            (acc, itinerary) => acc + parseDuration(itinerary.duration),
            0
          );
          const bDuration = b.itineraries.reduce(
            (acc, itinerary) => acc + parseDuration(itinerary.duration),
            0
          );
          return aDuration - bDuration;
        });
      case 'best':
      default:
        return flightsCopy;
    }
  }, [filteredFlights, sortValue]);

  // Update displayedFlights based on sortedFlights and pagination
  const displayedFlights = useMemo(() => {
    const indexLast = page * flightsPerPage;
    const indexFirst = indexLast - flightsPerPage;
    return sortedFlights.slice(indexFirst, indexLast);
  }, [sortedFlights, page, flightsPerPage]);

  // Handle Confirmation Dialog
  const handleOpenDialog = (flight) => {
    setSelectedFlight(flight);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFlight(null);
  };

  const confirmBooking = () => {
    setOpenDialog(false);
    navigate('/booking', { state: { flightDetails: selectedFlight } });
  };

  // Render Filters
  const renderFilters = () => (
    <Box className="flight-results-filters">
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      {/* Stops Filter */}
      <FormControl component="fieldset" variant="standard" className="flight-results-filter-section">
        <Typography variant="subtitle1">Stops</Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={stops.any}
                onChange={(e) => setStops({ ...stops, any: e.target.checked })}
                name="any"
              />
            }
            label="Any"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={stops['0']}
                onChange={(e) => setStops({ ...stops, '0': e.target.checked })}
                name="0"
              />
            }
            label="Non-stop"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={stops['1']}
                onChange={(e) => setStops({ ...stops, '1': e.target.checked })}
                name="1"
              />
            }
            label="1 Stop"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={stops['2']}
                onChange={(e) => setStops({ ...stops, '2': e.target.checked })}
                name="2"
              />
            }
            label="2+ Stops"
          />
        </FormGroup>
      </FormControl>

      {/* Airlines Filter */}
      <FormControl component="fieldset" variant="standard" className="flight-results-filter-section">
        <Typography variant="subtitle1">Airlines</Typography>
        <FormGroup>
          {availableAirlines.map((airline) => (
            <FormControlLabel
              key={airline}
              control={
                <Checkbox
                  checked={selectedAirlines.includes(airline)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAirlines([...selectedAirlines, airline]);
                    } else {
                      setSelectedAirlines(selectedAirlines.filter((a) => a !== airline));
                    }
                  }}
                  name={airline}
                />
              }
              label={airline}
            />
          ))}
        </FormGroup>
      </FormControl>

      {/* Flight Times Filter */}
      <FormControl component="fieldset" variant="standard" className="flight-results-filter-section">
        <Typography variant="subtitle1">Flight Times</Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={flightTimes.morning}
                onChange={(e) =>
                  setFlightTimes({ ...flightTimes, morning: e.target.checked })
                }
                name="morning"
              />
            }
            label="Morning (6 AM - 12 PM)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={flightTimes.afternoon}
                onChange={(e) =>
                  setFlightTimes({ ...flightTimes, afternoon: e.target.checked })
                }
                name="afternoon"
              />
            }
            label="Afternoon (12 PM - 6 PM)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={flightTimes.evening}
                onChange={(e) =>
                  setFlightTimes({ ...flightTimes, evening: e.target.checked })
                }
                name="evening"
              />
            }
            label="Evening (6 PM - 12 AM)"
          />
        </FormGroup>
      </FormControl>

      {/* Price Range Filter */}
      <FormControl component="fieldset" variant="standard" className="flight-results-filter-section">
        <Typography variant="subtitle1">Price Range</Typography>
        <Box className="price-range-slider">
          <Slider
            value={priceRange}
            onChange={(e, newValue) => setPriceRange(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={2000}
            step={50}
            marks={[
              { value: 0, label: '$0' },
              { value: 500, label: '$500' },
              { value: 1000, label: '$1000' },
              { value: 1500, label: '$1500' },
              { value: 2000, label: '$2000+' },
            ]}
            aria-labelledby="price-range-slider"
          />
        </Box>
      </FormControl>
    </Box>
  );

  if (loading) {
    return (
      <div className="flight-results-loading">
        <CircularProgress color="primary" />
        <Typography variant="h6" className="flight-results-loading-text">
          Loading flight results...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flight-results-error">
        <Typography variant="h6" className="flight-results-error-text">
          {error}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/flights')}>
          Go to Search
        </Button>
      </div>
    );
  }

  if (!currentFlights || currentFlights.length === 0) {
    return (
      <div className="flight-results-empty">
        <Typography variant="h6" className="flight-results-empty-text">
          No flights found for your search criteria.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/flights')}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flight-results-page">
      {/* Filters Section */}
      <Box className="flight-results-filters-container">
        {renderFilters()}
      </Box>

      {/* Flight Results Container */}
      <Box className="flight-results-container">
        {/* Sorting Tabs */}
        <AppBar position="static" color="transparent" elevation={0}>
          <Tabs
            value={sortValue}
            onChange={handleSortChange}
            indicatorColor="primary"
            textColor="inherit"
            variant="fullWidth"
            className="flight-results-sorting-tabs"
            aria-label="sorting tabs"
          >
            <Tab label="Best" value="best" className="flight-results-sorting-tab" />
            <Tab label="Cheapest" value="cheapest" className="flight-results-sorting-tab" />
            <Tab label="Fastest" value="fastest" className="flight-results-sorting-tab" />
          </Tabs>
        </AppBar>

        {/* Flight Results Grid */}
        <Grid container spacing={3} className="flight-results-grid">
          {displayedFlights.map((flight, index) => {
            const details = extractFlightDetails(flight);
            return (
              <Grid item xs={12} key={flight.id || index}>
                <Box className="flight-results-card">
                  {/* Airline and Flight Details */}
                  <Box className="flight-results-details">
                    <img
                      src={details.airlineLogo}
                      alt={`${details.airlineName} logo`}
                      className="flight-results-airline-logo"
                    />
                    <Box className="flight-results-flight-info">
                      <Typography
                        variant="h6"
                        className={`flight-results-airline-name ${
                          details.airlineName === 'Unknown Airline' ? 'unknown-airline' : ''
                        }`}
                      >
                        {details.airlineName}
                      </Typography>
                      <Typography variant="body1" className="flight-info-text">
                        <strong>Flight Number:</strong> {details.flightNumber}
                      </Typography>
                      <Typography variant="body1" className="flight-info-text">
                        <strong>Route:</strong> {details.fullRoute}
                      </Typography>
                      <Typography variant="body1" className="flight-info-text">
                        <strong>Departure:</strong> {details.departureTime}
                      </Typography>
                      <Typography variant="body1" className="flight-info-text">
                        <strong>Arrival:</strong> {details.arrivalTime}
                      </Typography>
                      <Typography variant="body1" className="flight-info-text">
                        <StopIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Stops: {details.numberOfStops === 0 ? 'Non-stop' : `${details.numberOfStops} Stop(s)`}
                      </Typography>
                      <Typography variant="body1" className="flight-info-text">
                        <ScheduleIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Duration: {Math.floor(details.totalDuration / 60)}h {details.totalDuration % 60}m
                      </Typography>
                    </Box>
                  </Box>

                  {/* Price and Book Now Button */}
                  <Box className="flight-results-price-details">
                    <Typography variant="h6" className="flight-results-price">
                      {details.price?.currency && details.price.total
                        ? `${details.price.currency} ${formatPrice(details.price.total)}`
                        : 'Price Unavailable'}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleBook(details.flight)}
                      className="flight-results-book-button"
                      aria-label={`Book flight ${details.flightNumber} with ${details.airlineName}`}
                    >
                      BOOK NOW
                    </Button>
                  </Box>

                  {/* Accordion for Itineraries */}
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel-${flight.id}-content`}
                      id={`panel-${flight.id}-header`}
                    >
                      <Typography>View Itineraries</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {flight.itineraries.map((itinerary, idx) => (
                        <div key={idx} className="itinerary">
                          <Typography variant="subtitle1" gutterBottom>
                            Itinerary {idx + 1} - Duration: {itinerary.duration}
                          </Typography>
                          {itinerary.segments.map((segment) => (
                            <Grid container key={segment.id} spacing={2} className="segment-details">
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>Departure:</strong> {segment.departure.iataCode} at{' '}
                                  {new Date(segment.departure.at).toLocaleString()}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Carrier:</strong> {segment.carrierCode}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Flight Number:</strong> {segment.number}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Aircraft:</strong> {segment.aircraft.code}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>Arrival:</strong> {segment.arrival.iataCode} at{' '}
                                  {new Date(segment.arrival.at).toLocaleString()}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Duration:</strong> {segment.duration}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Number of Stops:</strong> {segment.numberOfStops}
                                </Typography>
                              </Grid>
                            </Grid>
                          ))}
                        </div>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Pagination */}
        {sortedFlights.length > flightsPerPage && (
          <Box className="flight-results-pagination-container">
            <Pagination
              count={Math.ceil(sortedFlights.length / flightsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              siblingCount={1}
              boundaryCount={1}
              shape="rounded"
              size="large"
              showFirstButton
              showLastButton
              aria-label="flight results pagination"
            />
          </Box>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} aria-labelledby="confirm-booking-dialog">
        <DialogTitle id="confirm-booking-dialog">Confirm Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to book this flight with <strong>{selectedFlight?.airlineName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={confirmBooking} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FlightResults;
