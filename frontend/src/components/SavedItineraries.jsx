import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
  Tooltip,
  Snackbar,
  DialogContentText,
  InputAdornment,
  Pagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Search,
  GetApp,
  Publish,
  Sort,
  Visibility,
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  GoogleMap,
  Marker,
  Polyline,
  DirectionsRenderer,
  useLoadScript,
} from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

// Map component for rendering itineraries
const ItineraryMap = ({ itinerary }) => {
  const [directions, setDirections] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    const fetchDirections = async () => {
      setMapLoading(true);
      try {
        const directionsService = new window.google.maps.DirectionsService();
        const waypoints = itinerary.destinations.slice(1, -1).map((destination) => ({
          location: destination,
          stopover: true,
        }));

        directionsService.route(
          {
            origin: itinerary.destinations[0],
            destination: itinerary.destinations[itinerary.destinations.length - 1],
            waypoints: waypoints,
            optimizeWaypoints: true,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirections(result);
            } else {
              console.error(`Error fetching directions ${result}`);
            }
            setMapLoading(false);
          }
        );
      } catch (error) {
        console.error('Error fetching directions:', error);
        setMapLoading(false);
      }
    };

    if (isLoaded && itinerary.destinations.length > 1) {
      fetchDirections();
    }
  }, [itinerary.destinations, isLoaded]);

  if (!isLoaded || mapLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (itinerary.destinations.length === 0) {
    return <Alert severity="warning">No valid destinations to display on the map.</Alert>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={6}
      center={{ lat: 0, lng: 0 }}
    >
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
};

const SavedItineraries = ({ idToken, API_BASE_URL }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [itineraries, setItineraries] = useState([]);
  const [filteredItineraries, setFilteredItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [currentItineraryId, setCurrentItineraryId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [itineraryToDelete, setItineraryToDelete] = useState(null);

  // Detailed View Dialog State
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState(null);

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form validation schema using Yup
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Itinerary name is required.'),
    destinations: Yup.string().required('At least one destination is required.'),
    startDate: Yup.date().required('Start date is required.').nullable(),
    endDate: Yup.date()
      .required('End date is required.')
      .nullable()
      .min(Yup.ref('startDate'), 'End date cannot be before start date.'),
    notes: Yup.string(),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/itineraries`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setItineraries(response.data.itineraries);
        setFilteredItineraries(response.data.itineraries);
      } catch (err) {
        console.error('Error fetching itineraries:', err.response ? err.response.data : err.message);
        setFetchError('Failed to load itineraries.');
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [idToken, API_BASE_URL]);

  useEffect(() => {
    let filtered = itineraries;

    // Search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(
        (itinerary) =>
          itinerary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          itinerary.destinations.some((dest) =>
            dest.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Date range filter
    if (filterStartDate || filterEndDate) {
      filtered = filtered.filter((itinerary) => {
        const itineraryStartDate = new Date(itinerary.startDate);
        const itineraryEndDate = new Date(itinerary.endDate);
        if (filterStartDate && filterEndDate) {
          return (
            itineraryStartDate >= filterStartDate && itineraryEndDate <= filterEndDate
          );
        } else if (filterStartDate) {
          return itineraryStartDate >= filterStartDate;
        } else if (filterEndDate) {
          return itineraryEndDate <= filterEndDate;
        }
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'startDate') {
        return new Date(a.startDate) - new Date(b.startDate);
      } else if (sortBy === 'endDate') {
        return new Date(a.endDate) - new Date(b.endDate);
      }
      return 0;
    });

    setFilteredItineraries(filtered);
    setCurrentPage(1);
  }, [searchQuery, itineraries, sortBy, filterStartDate, filterEndDate]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleOpenDialog = (mode, itinerary = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && itinerary) {
      setCurrentItineraryId(itinerary.id);
      reset({
        name: itinerary.name,
        destinations: itinerary.destinations.join(', '),
        startDate: itinerary.startDate ? new Date(itinerary.startDate) : null,
        endDate: itinerary.endDate ? new Date(itinerary.endDate) : null,
        notes: itinerary.notes || '',
      });
    } else {
      setCurrentItineraryId(null);
      reset({
        name: '',
        destinations: '',
        startDate: null,
        endDate: null,
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenDetailDialog = (itinerary) => {
    setCurrentItinerary(itinerary);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setCurrentItinerary(null);
  };

  const onSubmit = async (data) => {
    const { name, destinations, startDate, endDate, notes } = data;
    const destinationsArray = destinations.split(',').map((dest) => dest.trim());

    try {
      setLoading(true);
      if (dialogMode === 'add') {
        const response = await axios.post(
          `${API_BASE_URL}/api/itineraries`,
          {
            name,
            destinations: destinationsArray,
            startDate,
            endDate,
            notes,
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        setItineraries((prev) => [...prev, response.data.itinerary]);
        setSnackbar({ open: true, message: 'Itinerary added successfully.', severity: 'success' });
      } else if (dialogMode === 'edit') {
        const response = await axios.put(
          `${API_BASE_URL}/api/itineraries/${currentItineraryId}`,
          {
            name,
            destinations: destinationsArray,
            startDate,
            endDate,
            notes,
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        setItineraries((prev) =>
          prev.map((itinerary) =>
            itinerary.id === response.data.itinerary.id ? response.data.itinerary : itinerary
          )
        );
        setSnackbar({ open: true, message: 'Itinerary updated successfully.', severity: 'success' });
      }
      setDialogOpen(false);
    } catch (err) {
      console.error('Error saving itinerary:', err.response ? err.response.data : err.message);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save itinerary.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmation = (id) => {
    setItineraryToDelete(id);
    setConfirmDialogOpen(true);
  };

  const handleDeleteItinerary = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/itineraries/${itineraryToDelete}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setItineraries((prev) => prev.filter((itinerary) => itinerary.id !== itineraryToDelete));
      setSnackbar({ open: true, message: 'Itinerary deleted successfully.', severity: 'success' });
    } catch (err) {
      console.error('Error deleting itinerary:', err.response ? err.response.data : err.message);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete itinerary.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredItineraries.length / itemsPerPage);
  const paginatedItineraries = filteredItineraries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Export itinerary as JSON
  const handleExportItinerary = (itinerary) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(itinerary));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${itinerary.name}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Import itinerary from JSON
  const handleImportItinerary = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setLoading(true);
        const text = await file.text();
        const importedItinerary = JSON.parse(text);

        // Validate imported data
        const isValid = await validationSchema.isValid(importedItinerary);
        if (!isValid) {
          setSnackbar({ open: true, message: 'Invalid itinerary file.', severity: 'error' });
          return;
        }

        // Save imported itinerary
        const response = await axios.post(
          `${API_BASE_URL}/api/itineraries`,
          importedItinerary,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        setItineraries((prev) => [...prev, response.data.itinerary]);
        setSnackbar({ open: true, message: 'Itinerary imported successfully.', severity: 'success' });
      } catch (error) {
        console.error('Error importing itinerary:', error);
        setSnackbar({ open: true, message: 'Failed to import itinerary.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Saved Itineraries
      </Typography>
      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError}
        </Alert>
      )}

      {/* Search and Sort Bar */}
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Search itineraries..."
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel id="sort-by-label">
              <Sort /> Sort By
            </InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              onChange={handleSortChange}
              label={
                <>
                  <Sort /> Sort By
                </>
              }
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="startDate">Start Date</MenuItem>
              <MenuItem value="endDate">End Date</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Filter Start Date"
              value={filterStartDate}
              onChange={(date) => setFilterStartDate(date)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
            <DatePicker
              label="Filter End Date"
              value={filterEndDate}
              onChange={(date) => setFilterEndDate(date)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Box>
      </Box>

      {/* Itineraries Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
        >
          <Typography variant="subtitle1">Your Itineraries</Typography>
          <Box>
            <input
              accept=".json"
              style={{ display: 'none' }}
              id="import-itinerary"
              type="file"
              onChange={handleImportItinerary}
            />
            <label htmlFor="import-itinerary">
              <Button
                variant="contained"
                startIcon={<Publish />}
                component="span"
                sx={{ mr: 1 }}
              >
                Import
              </Button>
            </label>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog('add')}
              sx={{
                textTransform: 'none',
                transition: 'background-color 0.3s',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              Add Itinerary
            </Button>
          </Box>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : filteredItineraries.length === 0 ? (
          <Typography>No itineraries found. Add one to get started!</Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              {paginatedItineraries.map((itinerary) => (
                <Grid item xs={12} sm={6} md={4} key={itinerary.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" component="div">
                        {itinerary.name}
                      </Typography>
                      <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        {new Date(itinerary.startDate).toLocaleDateString()} -{' '}
                        {new Date(itinerary.endDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Destinations:</strong> {itinerary.destinations.join(', ')}
                      </Typography>
                      {itinerary.notes && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Notes:</strong> {itinerary.notes}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Tooltip title="View Details">
                        <IconButton onClick={() => handleOpenDetailDialog(itinerary)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export">
                        <IconButton onClick={() => handleExportItinerary(itinerary)}>
                          <GetApp />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenDialog('edit', itinerary)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteConfirmation(itinerary.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Itinerary Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'add' ? 'Add Itinerary' : 'Edit Itinerary'}</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate autoComplete="off">
            <TextField
              margin="dense"
              label="Itinerary Name"
              name="name"
              type="text"
              fullWidth
              variant="outlined"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              margin="dense"
              label="Destinations (comma separated)"
              name="destinations"
              type="text"
              fullWidth
              variant="outlined"
              {...register('destinations')}
              error={!!errors.destinations}
              helperText={errors.destinations?.message}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Controller
                name="startDate"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      inputFormat="MM/dd/yyyy"
                      value={field.value}
                      onChange={(date) => field.onChange(date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!errors.startDate}
                          helperText={errors.startDate?.message}
                        />
                      )}
                    />
                  </LocalizationProvider>
                )}
              />
              <Controller
                name="endDate"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      inputFormat="MM/dd/yyyy"
                      value={field.value}
                      onChange={(date) => field.onChange(date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!errors.endDate}
                          helperText={errors.endDate?.message}
                        />
                      )}
                    />
                  </LocalizationProvider>
                )}
              />
            </Box>
            <TextField
              margin="dense"
              label="Notes"
              name="notes"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              {...register('notes')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              textTransform: 'none',
              transition: 'background-color 0.3s, color 0.3s',
              '&:hover': {
                backgroundColor: theme.palette.grey[300],
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
            sx={{
              textTransform: 'none',
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            {dialogMode === 'add' ? 'Add Itinerary' : 'Update Itinerary'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Itinerary Detail Dialog */}
      {currentItinerary && (
        <Dialog
          open={detailDialogOpen}
          onClose={handleCloseDetailDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>{currentItinerary.name}</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              Dates:
            </Typography>
            <Typography>
              {new Date(currentItinerary.startDate).toLocaleDateString()} -{' '}
              {new Date(currentItinerary.endDate).toLocaleDateString()}
            </Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Destinations:
            </Typography>
            <Typography>{currentItinerary.destinations.join(' ➔ ')}</Typography>
            {currentItinerary.notes && (
              <>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Notes:
                </Typography>
                <Typography>{currentItinerary.notes}</Typography>
              </>
            )}
            <Box sx={{ mt: 4 }}>
              <ItineraryMap itinerary={currentItinerary} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDetailDialog}
              sx={{
                textTransform: 'none',
                transition: 'background-color 0.3s, color 0.3s',
                '&:hover': {
                  backgroundColor: theme.palette.grey[300],
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Itinerary</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this itinerary? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            sx={{
              textTransform: 'none',
              transition: 'background-color 0.3s, color 0.3s',
              '&:hover': {
                backgroundColor: theme.palette.grey[300],
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteItinerary}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: theme.palette.error.dark,
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default SavedItineraries;
