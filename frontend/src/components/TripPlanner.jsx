import React, { useState, useEffect, useContext } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  MenuItem,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Box,
  Tooltip,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import '../styles/TripPlanner.css'; 
import { AuthContext } from '../context/AuthContext';

// Initialize localizer
const localizer = momentLocalizer(moment);

const DragAndDropCalendar = withDragAndDrop(Calendar);

const TripPlanner = () => { 
  const { idToken, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripType, setTripType] = useState('bus'); 
  const [tripOrigin, setTripOrigin] = useState('');
  const [tripDestination, setTripDestination] = useState('');
  const [tripStart, setTripStart] = useState(new Date());
  const [tripEnd, setTripEnd] = useState(new Date());
  const [tripError, setTripError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!idToken) return; 

    const fetchTrips = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/trips`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const formattedEvents = response.data.map((trip) => ({
          id: trip.id,
          title: `${trip.type.toUpperCase()} Trip`,
          start: new Date(trip.departureTime),
          end: new Date(trip.arrivalTime),
          type: trip.type,
          origin: trip.origin,
          destination: trip.destination,
          description: trip.ticketProviderUrl || '',
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching trips:', error.response ? error.response.data : error.message);
        setTripError(
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : 'Failed to load trips.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [idToken, API_BASE_URL]);

  // Handle selecting a slot to create a new trip
  const handleSelectSlot = ({ start, end }) => {
    setSelectedTrip(null);
    setTripType('bus'); 
    setTripOrigin('');
    setTripDestination('');
    setTripStart(start);
    setTripEnd(end);
    setIsEditing(false);
    setTripError(null);
    setDialogOpen(true);
  };

  // Handle selecting an event to edit or delete
  const handleSelectEvent = (event) => {
    setSelectedTrip(event);
    setTripType(event.type);
    setTripOrigin(event.origin);
    setTripDestination(event.destination);
    setTripStart(event.start);
    setTripEnd(event.end);
    setIsEditing(true);
    setTripError(null);
    setDialogOpen(true);
  };

  // Handle saving a new trip or updating an existing one
  const handleSaveTrip = async () => {
    // Validation
    if (!tripType || !tripOrigin || !tripDestination || !tripStart || !tripEnd) {
      setTripError('All fields are required.');
      return;
    }

    if (new Date(tripEnd) <= new Date(tripStart)) {
      setTripError('Arrival time must be after departure time.');
      return;
    }

    const tripData = {
      type: tripType,
      origin: tripOrigin,
      destination: tripDestination,
      departureTime: tripStart.toISOString(),
      arrivalTime: tripEnd.toISOString(),
      duration: Math.round((tripEnd - tripStart) / 60000), 
      transitStops: [], 
      transitLines: [], 
      schedule: {}, 
      ticketProviderUrl: selectedTrip ? selectedTrip.description : '', 
    };

    try {
      if (isEditing && selectedTrip) {
        const response = await axios.put(
          `${API_BASE_URL}/api/trips/${selectedTrip.id}`,
          tripData,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        setEvents(
          events.map((evt) =>
            evt.id === selectedTrip.id
              ? {
                  ...evt,
                  title: `${response.data.type.toUpperCase()} Trip`,
                  start: new Date(response.data.departureTime),
                  end: new Date(response.data.arrivalTime),
                  type: response.data.type,
                  origin: response.data.origin,
                  destination: response.data.destination,
                  description: response.data.ticketProviderUrl || '',
                }
              : evt
          )
        );
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/trips`, tripData, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setEvents([
          ...events,
          {
            id: response.data.id,
            title: `${response.data.type.toUpperCase()} Trip`,
            start: new Date(response.data.departureTime),
            end: new Date(response.data.arrivalTime),
            type: response.data.type,
            origin: response.data.origin,
            destination: response.data.destination,
            description: response.data.ticketProviderUrl || '',
          },
        ]);
      }
      setDialogOpen(false);
      setTripError(null);
    } catch (error) {
      console.error('Error saving trip:', error.response ? error.response.data : error.message);
      setTripError(
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Failed to save trip.'
      );
    }
  };

  // Handle deleting a trip
  const handleDeleteTrip = async () => {
    if (!selectedTrip) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/trips/${selectedTrip.id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setEvents(events.filter((event) => event.id !== selectedTrip.id));
      setDialogOpen(false);
      setTripError(null);
    } catch (error) {
      console.error('Error deleting trip:', error.response ? error.response.data : error.message);
      setTripError(
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Failed to delete trip.'
      );
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setTripError(null);
  };

  // Handle event drop (drag-and-drop)
  const handleEventDrop = async ({ event, start, end }) => {
    // Validation
    if (new Date(end) <= new Date(start)) {
      setTripError('Arrival time must be after departure time.');
      return;
    }

    const updatedTrip = { ...event, start, end };

    const tripData = {
      type: updatedTrip.type,
      origin: updatedTrip.origin,
      destination: updatedTrip.destination,
      departureTime: start.toISOString(),
      arrivalTime: end.toISOString(),
      duration: Math.round((end - start) / 60000),
      transitStops: [], 
      transitLines: [], 
      schedule: {}, 
      ticketProviderUrl: updatedTrip.description || '',
    };

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/trips/${event.id}`,
        tripData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setEvents(
        events.map((evt) =>
          evt.id === event.id
            ? {
                ...evt,
                title: `${response.data.type.toUpperCase()} Trip`,
                start: new Date(response.data.departureTime),
                end: new Date(response.data.arrivalTime),
                type: response.data.type,
                origin: response.data.origin,
                destination: response.data.destination,
                description: response.data.ticketProviderUrl || '',
              }
            : evt
        )
      );
    } catch (error) {
      console.error('Error updating trip on drop:', error.response ? error.response.data : error.message);
      setTripError(
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Failed to update trip.'
      );
    }
  };

  // Handle event resize
  const handleEventResize = async ({ event, start, end }) => {
    // Validation
    if (new Date(end) <= new Date(start)) {
      setTripError('Arrival time must be after departure time.');
      return;
    }

    const updatedTrip = { ...event, start, end };

    const tripData = {
      type: updatedTrip.type,
      origin: updatedTrip.origin,
      destination: updatedTrip.destination,
      departureTime: start.toISOString(),
      arrivalTime: end.toISOString(),
      duration: Math.round((end - start) / 60000),
      transitStops: [], 
      transitLines: [],
      schedule: {}, 
      ticketProviderUrl: updatedTrip.description || '',
    };

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/trips/${event.id}`,
        tripData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setEvents(
        events.map((evt) =>
          evt.id === event.id
            ? {
                ...evt,
                title: `${response.data.type.toUpperCase()} Trip`,
                start: new Date(response.data.departureTime),
                end: new Date(response.data.arrivalTime),
                type: response.data.type,
                origin: response.data.origin,
                destination: response.data.destination,
                description: response.data.ticketProviderUrl || '',
              }
            : evt
        )
      );
    } catch (error) {
      console.error('Error updating trip on resize:', error.response ? error.response.data : error.message);
      setTripError(
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Failed to update trip.'
      );
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">You must be logged in to view your trips.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {tripError && <Alert severity="error" sx={{ mb: 2 }}>{tripError}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: isMobile ? '60vh' : '80vh', width: '100%', mb: 4 }}>
          <DragAndDropCalendar
            localizer={localizer}
            events={events}
            selectable
            resizable
            defaultView={isMobile ? 'agenda' : 'month'} 
            defaultDate={new Date()}
            style={{ height: '100%', width: '100%' }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            draggableAccessor={() => true}
            resizableAccessor={() => true}
            views={isMobile ? ['agenda'] : ['month', 'week', 'day', 'agenda']}
            step={30}
            showMultiDayTimes
          />
        </Box>
      )}
      {/* Dialog for adding or editing a trip */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile} 
      >
        <DialogTitle>{isEditing ? 'Edit Trip' : 'Add Trip'}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Trip Type"
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
            fullWidth
            variant="standard"
            margin="dense"
            sx={{ mb: 2 }}
          >
            <MenuItem value="bus">Bus</MenuItem>
            <MenuItem value="train">Train</MenuItem>
            <MenuItem value="flight">Flight</MenuItem>
            {/* Add more trip types as needed */}
          </TextField>
          <TextField
            margin="dense"
            label="Origin"
            type="text"
            fullWidth
            variant="standard"
            value={tripOrigin}
            onChange={(e) => setTripOrigin(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Destination"
            type="text"
            fullWidth
            variant="standard"
            value={tripDestination}
            onChange={(e) => setTripDestination(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Departure Time"
            type="datetime-local"
            fullWidth
            variant="standard"
            value={moment(tripStart).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => setTripStart(new Date(e.target.value))}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Arrival Time"
            type="datetime-local"
            fullWidth
            variant="standard"
            value={moment(tripEnd).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => setTripEnd(new Date(e.target.value))}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          {/* Add more fields as required by the backend */}
          {tripError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {tripError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          {isEditing && (
            <Tooltip title="Delete Trip">
              <Button
                onClick={handleDeleteTrip}
                color="error"
                startIcon={<Delete />}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  textTransform: 'none',
                  transition: 'background-color var(--transition-duration), color var(--transition-duration)',
                  '&:hover': {
                    backgroundColor: '#f44336',
                    color: '#fff',
                  },
                }}
              >
                Delete
              </Button>
            </Tooltip>
          )}
          <Button
            onClick={handleDialogClose}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              textTransform: 'none',
              transition: 'background-color var(--transition-duration), color var(--transition-duration)',
              '&:hover': {
                backgroundColor: '#ccc',
                color: '#333',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveTrip}
            variant="contained"
            color="primary"
            size={isMobile ? 'small' : 'medium'}
            sx={{
              textTransform: 'none',
              transition: 'background-color var(--transition-duration), color var(--transition-duration)',
              '&:hover': {
                backgroundColor: '#1976d2',
                color: '#fff',
              },
            }}
          >
            {isEditing ? 'Update Trip' : 'Save Trip'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripPlanner;
