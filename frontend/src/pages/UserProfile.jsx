import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Snackbar,
  useMediaQuery,
  useTheme,
  Tooltip,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Rating,
  Chip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  PhotoCamera,
  Search,
  Sort,
  Send,
  SaveAlt,
} from '@mui/icons-material';
import TripPlanner from '../components/TripPlanner';
import BudgetPlanner from '../components/BudgetPlanner';
import TravelStatistics from '../components/TravelStatistics'; 
import SavedItineraries from '../components/SavedItineraries'; 
import PaymentSubscriptions from '../components/PaymentSubscriptions';
import SupportHelp from '../components/SupportHelp'; 
import { gapi } from 'gapi-script'; 
import '../styles/UserProfile.css'; 

// Initialize Google API client
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY; 

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

// Utility component for Tab Panels
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
};

// Accessibility props for tabs
const a11yProps = (index) => {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
};

const UserProfile = () => {
  const { isAuthenticated, user, idToken, loading } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const [tabValue, setTabValue] = useState(0);

  // State for User Info Editing
  const [editMode, setEditMode] = useState(false);
  const [userInfo, setUserInfo] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    PhoneNumber: '',
  });
  const [userInfoLoading, setUserInfoLoading] = useState(false);
  const [userInfoError, setUserInfoError] = useState(null);

  // States for Wishlist Dialog
  const [wishlistDialogOpen, setWishlistDialogOpen] = useState(false);
  const [wishlistDialogMode, setWishlistDialogMode] = useState('add'); 
  const [wishlistPlaceData, setWishlistPlaceData] = useState({
    type: '',
    placeId: '',
    name: '',
    address: '',
    rating: 0,
    priceLevel: 1,
    photoReference: '',
  });
  const [currentWishlistId, setCurrentWishlistId] = useState(null);
  const [wishlistPlaces, setWishlistPlaces] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState(null);

  // States for Trip History
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState(null);

  // States for Profile Picture Upload
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadPicError, setUploadPicError] = useState(null);

  // States for Snackbar Notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); 

  // States for Wishlist Sorting and Filtering
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Google API Initialization
  useEffect(() => {
    function start() {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      });
    }
    gapi.load('client:auth2', start);
  }, []);

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && idToken) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/protected/dashboard`, {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          setProfileData(response.data.user);
          setUserInfo({
            FirstName: response.data.user.FirstName || '',
            LastName: response.data.user.LastName || '',
            Email: response.data.user.Email || '',
            PhoneNumber: response.data.user.PhoneNumber || '',
          });
          setFetchingProfile(false);
        } catch (error) {
          console.error('Error fetching profile data:', error.response ? error.response.data : error.message);
          setProfileError('Failed to load profile data.');
          setFetchingProfile(false);
        }
      }
    };

    fetchProfile();
  }, [user, idToken, API_BASE_URL]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [loading, isAuthenticated]);

  // Handle Tab Change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle User Info Change
  const handleUserInfoChange = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Save User Info
  const handleSaveUserInfo = async () => {
    setUserInfoLoading(true);
    setUserInfoError(null);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/user/profile`, userInfo, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setProfileData(response.data.user);
      setEditMode(false);
      setSnackbarMsg('Profile updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating user info:', error.response ? error.response.data : error.message);
      setUserInfoError('Failed to update profile.');
      setSnackbarMsg('Failed to update profile.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUserInfoLoading(false);
    }
  };

  // Fetch Wishlist Places
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/favorites`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setWishlistPlaces(response.data.favorites);
      } catch (error) {
        console.error('Error fetching wishlist:', error.response ? error.response.data : error.message);
        setWishlistError('Failed to load wishlist.');
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchWishlist();
  }, [idToken, API_BASE_URL]);

  // Handle Add Wishlist Place
  const handleAddWishlistPlace = () => {
    setWishlistDialogMode('add');
    setWishlistPlaceData({
      type: '',
      placeId: '',
      name: '',
      address: '',
      rating: 0,
      priceLevel: 1,
      photoReference: '',
    });
    setCurrentWishlistId(null);
    setWishlistDialogOpen(true);
  };

  // Handle Edit Wishlist Place
  const handleEditWishlistPlace = (id) => {
    const placeToEdit = wishlistPlaces.find((place) => place.id === id);
    if (placeToEdit) {
      setWishlistDialogMode('edit');
      setWishlistPlaceData({
        type: placeToEdit.type || '',
        placeId: placeToEdit.placeId || '',
        name: placeToEdit.name || '',
        address: placeToEdit.address || '',
        rating: placeToEdit.rating || 0,
        priceLevel: placeToEdit.priceLevel || 1,
        photoReference: placeToEdit.photoReference || '',
      });
      setCurrentWishlistId(id);
      setWishlistDialogOpen(true);
    } else {
      setSnackbarMsg('Wishlist place not found.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle Delete Wishlist Place
  const handleDeleteWishlistPlace = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/favorites/${id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setWishlistPlaces(wishlistPlaces.filter((place) => place.id !== id));
      setSnackbarMsg('Wishlist place deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting wishlist place:', error.response ? error.response.data : error.message);
      setWishlistError('Failed to delete wishlist place.');
      setSnackbarMsg('Failed to delete wishlist place.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle Save Wishlist Place
  const handleSaveWishlistPlace = async () => {
    const { type, placeId, name, address, rating, priceLevel, photoReference } = wishlistPlaceData;

    // Validation
    if (!name.trim()) {
      setWishlistError('Place name is required.');
      return;
    }
    if (!type) {
      setWishlistError('Type is required.');
      return;
    }
    if (!placeId && wishlistDialogMode === 'add') {
      setWishlistError('Place ID is required.');
      return;
    }

    try {
      if (wishlistDialogMode === 'add') {
        const response = await axios.post(
          `${API_BASE_URL}/api/favorites`,
          {
            type,
            placeId,
            name,
            address,
            rating,
            priceLevel,
            photoReference,
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        setWishlistPlaces([...wishlistPlaces, response.data.favorite]);
        setSnackbarMsg('Wishlist place added successfully!');
        setSnackbarSeverity('success');
      } else if (wishlistDialogMode === 'edit') {
        const response = await axios.put(
          `${API_BASE_URL}/api/favorites/${currentWishlistId}`,
          {
            type,
            placeId,
            name,
            address,
            rating,
            priceLevel,
            photoReference,
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        setWishlistPlaces(
          wishlistPlaces.map((place) =>
            place.id === currentWishlistId ? response.data.favorite : place
          )
        );
        setSnackbarMsg('Wishlist place updated successfully!');
        setSnackbarSeverity('success');
      }
      setWishlistDialogOpen(false);
      setWishlistError(null);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving wishlist place:', error.response ? error.response.data : error.message);
      setWishlistError('Failed to save wishlist place.');
      setSnackbarMsg('Failed to save wishlist place.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Fetch Trip History
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/trips`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setTrips(response.data);
      } catch (error) {
        console.error('Error fetching trips:', error.response ? error.response.data : error.message);
        setTripsError('Failed to load trip history.');
      } finally {
        setTripsLoading(false);
      }
    };

    fetchTrips();
  }, [idToken, API_BASE_URL]);

  // Handle Profile Picture Upload
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingPic(true);
      setUploadPicError(null);

      const formData = new FormData();
      formData.append('profilePicture', file);

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/user/profile-picture`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        setProfileData(response.data.user);
        setSnackbarMsg('Profile picture uploaded successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error uploading profile picture:', error.response ? error.response.data : error.message);
        setUploadPicError('Failed to upload profile picture.');
        setSnackbarMsg('Failed to upload profile picture.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setUploadingPic(false);
      }
    }
  };

  // Handle Snackbar Close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Handle Wishlist Dialog Close
  const handleWishlistDialogClose = () => {
    setWishlistDialogOpen(false);
    setWishlistError(null);
  };

  // Handle Google Calendar Sync
  const handleSyncToGoogleCalendar = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      const tripEvents = trips.map((trip) => ({
        summary: `${trip.type.charAt(0).toUpperCase() + trip.type.slice(1)} Trip: ${trip.origin} to ${trip.destination}`,
        start: {
          dateTime: new Date(trip.departureTime).toISOString(),
        },
        end: {
          dateTime: new Date(trip.arrivalTime).toISOString(),
        },
        description: `Duration: ${trip.duration} minutes`,
      }));

      const batch = gapi.client.newBatch();

      tripEvents.forEach((event) => {
        const request = gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: event,
        });
        batch.add(request);
      });

      batch.then(
        (response) => {
          console.log('Events synced to Google Calendar:', response);
          setSnackbarMsg('Trips synced to Google Calendar successfully!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        },
        (err) => {
          console.error('Error syncing to Google Calendar:', err);
          setSnackbarMsg('Failed to sync trips to Google Calendar.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      );
    } catch (error) {
      console.error('Error during Google Calendar sync:', error);
      setSnackbarMsg('An error occurred while syncing to Google Calendar.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle Wishlist Place Data Change
  const handleWishlistPlaceDataChange = (e) => {
    const { name, value } = e.target;
    setWishlistPlaceData({
      ...wishlistPlaceData,
      [name]: value,
    });
  };

  // Handle Rating Change
  const handleRatingChange = (event, newValue) => {
    setWishlistPlaceData({
      ...wishlistPlaceData,
      rating: newValue,
    });
  };

  // Handle Price Level Change
  const handlePriceLevelChange = (event) => {
    setWishlistPlaceData({
      ...wishlistPlaceData,
      priceLevel: event.target.value,
    });
  };

  // Handle Type Change
  const handleTypeChange = (event) => {
    setWishlistPlaceData({
      ...wishlistPlaceData,
      type: event.target.value,
    });
  };

  // Handle Photo Reference Change
  const handlePhotoReferenceChange = (e) => {
    setWishlistPlaceData({
      ...wishlistPlaceData,
      photoReference: e.target.value,
    });
  };

  // Handle Sorting
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Apply Sorting, Filtering, and Searching
  const filteredAndSortedWishlist = wishlistPlaces
    .filter((place) => {
      if (filterType && place.type !== filterType) return false;
      if (searchTerm && !place.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      if (typeof fieldA === 'string') {
        return sortOrder === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
      }
      if (typeof fieldA === 'number') {
        return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      }
      return 0;
    });

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
      {/* Welcome Message */}
      {profileData && (
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom align="center">
          Welcome, {profileData.FirstName}!
        </Typography>
      )}

      {/* Tabs Navigation */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="User Profile Tabs"
        >
          <Tab label="User Info" {...a11yProps(0)} />
          <Tab label="Trip History" {...a11yProps(1)} />
          <Tab label="Wishlist" {...a11yProps(2)} />
          <Tab label="Trip Planner" {...a11yProps(3)} />
          <Tab label="Budget Planner" {...a11yProps(4)} />
          <Tab label="Travel Statistics" {...a11yProps(5)} /> 
          <Tab label="Saved Itineraries" {...a11yProps(6)} /> 
          <Tab label="Payment & Subscriptions" {...a11yProps(7)} /> 
          <Tab label="Support & Help" {...a11yProps(8)} /> 
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* User Information */}
        {fetchingProfile ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : profileError ? (
          <Alert severity="error">{profileError}</Alert>
        ) : (
          <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={4}>
              {/* Profile Picture Section */}
              <Grid item xs={12} sm={4} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar
                    alt={`${userInfo.FirstName} ${userInfo.LastName}`}
                    src={profileData && profileData.ProfilePicture}
                    sx={{
                      width: { xs: 80, sm: 100, md: 120 },
                      height: { xs: 80, sm: 100, md: 120 },
                      mb: 2,
                      border: `2px solid ${theme.palette.primary.main}`,
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                  <label htmlFor="profile-pic-upload">
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="profile-pic-upload"
                      type="file"
                      onChange={handleProfilePicChange}
                    />
                    <Tooltip title="Upload New Profile Picture">
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={<PhotoCamera />}
                        disabled={uploadingPic}
                        sx={{
                          textTransform: 'none',
                          transition: 'background-color 0.3s',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                          },
                        }}
                        size={isMobile ? 'small' : 'medium'}
                      >
                        Upload
                      </Button>
                    </Tooltip>
                  </label>
                  {uploadPicError && <Alert severity="error" sx={{ mt: 2 }}>{uploadPicError}</Alert>}
                </Box>
              </Grid>

              {/* User Details Section */}
              <Grid item xs={12} sm={8} md={9}>
                {!editMode ? (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Name: {`${userInfo.FirstName} ${userInfo.LastName}`}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Email: {userInfo.Email}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Phone: {userInfo.PhoneNumber}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => setEditMode(true)}
                      sx={{
                        textTransform: 'none',
                        transition: 'background-color 0.3s',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                          color: 'white',
                        },
                      }}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      Edit Profile
                    </Button>
                  </Box>
                ) : (
                  <Box component="form" noValidate autoComplete="off">
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          margin="dense"
                          label="First Name"
                          name="FirstName"
                          type="text"
                          fullWidth
                          variant="standard"
                          value={userInfo.FirstName}
                          onChange={handleUserInfoChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          margin="dense"
                          label="Last Name"
                          name="LastName"
                          type="text"
                          fullWidth
                          variant="standard"
                          value={userInfo.LastName}
                          onChange={handleUserInfoChange}
                        />
                      </Grid>
                    </Grid>
                    <TextField
                      margin="dense"
                      label="Email"
                      name="Email"
                      type="email"
                      fullWidth
                      variant="standard"
                      value={userInfo.Email}
                      onChange={handleUserInfoChange}
                    />
                    <TextField
                      margin="dense"
                      label="Phone Number"
                      name="PhoneNumber"
                      type="tel"
                      fullWidth
                      variant="standard"
                      value={userInfo.PhoneNumber}
                      onChange={handleUserInfoChange}
                    />
                    {userInfoError && <Alert severity="error" sx={{ mt: 2 }}>{userInfoError}</Alert>}
                    <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveUserInfo}
                        disabled={userInfoLoading}
                        sx={{
                          textTransform: 'none',
                          mr: 2,
                          transition: 'background-color 0.3s',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                          },
                        }}
                        size={isMobile ? 'small' : 'medium'}
                      >
                        {userInfoLoading ? <CircularProgress size={24} /> : 'Save'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditMode(false)}
                        sx={{
                          textTransform: 'none',
                          transition: 'background-color 0.3s, color 0.3s',
                          '&:hover': {
                            backgroundColor: theme.palette.grey[300],
                          },
                        }}
                        size={isMobile ? 'small' : 'medium'}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Trip History */}
        {tripsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : tripsError ? (
          <Alert severity="error">{tripsError}</Alert>
        ) : trips.length === 0 ? (
          <Typography>No trips found.</Typography>
        ) : (
          <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Trip History</Typography>
              <Button
                variant="contained"
                startIcon={<Edit />} 
                onClick={handleSyncToGoogleCalendar}
                sx={{
                  textTransform: 'none',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
                size={isMobile ? 'small' : 'medium'}
              >
                Sync to Google Calendar
              </Button>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Trip ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Origin</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Departure Time</TableCell>
                    <TableCell>Arrival Time</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Duration (mins)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell>{trip.id}</TableCell>
                      <TableCell>{trip.type.charAt(0).toUpperCase() + trip.type.slice(1)}</TableCell>
                      <TableCell>{trip.origin}</TableCell>
                      <TableCell>{trip.destination}</TableCell>
                      <TableCell>{new Date(trip.departureTime).toLocaleString()}</TableCell>
                      <TableCell>{new Date(trip.arrivalTime).toLocaleString()}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{trip.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Wishlist */}
        <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6">Wishlist</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddWishlistPlace}
              sx={{
                textTransform: 'none',
                transition: 'background-color 0.3s',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
              size={isMobile ? 'small' : 'medium'}
            >
              Add
            </Button>
          </Box>

          {/* Search and Filter Section */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <TextField
              label="Search by Name"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: <Search />,
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="filter-type-label">Filter by Type</InputLabel>
              <Select
                labelId="filter-type-label"
                label="Filter by Type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="car_rental">Car Rental</MenuItem>
                <MenuItem value="attraction">Attraction</MenuItem>
                <MenuItem value="flight">Flight</MenuItem>
                <MenuItem value="hotel">Hotel</MenuItem>
                <MenuItem value="restaurant">Restaurant</MenuItem>
                <MenuItem value="train_station">Train Station</MenuItem>
                <MenuItem value="subway_station">Subway Station</MenuItem>
                <MenuItem value="bus_station">Bus Station</MenuItem>
                <MenuItem value="transit_station">Transit Station</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="sort-field-label">Sort By</InputLabel>
              <Select
                labelId="sort-field-label"
                label="Sort By"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="type">Type</MenuItem>
                <MenuItem value="priceLevel">Price Level</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="createdAt">Date Added</MenuItem>
              </Select>
            </FormControl>

            {sortField && (
              <Button
                variant="outlined"
                startIcon={<Sort />}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                size="small"
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            )}
          </Box>

          {wishlistLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh' }}>
              <CircularProgress />
            </Box>
          ) : wishlistError ? (
            <Alert severity="error">{wishlistError}</Alert>
          ) : filteredAndSortedWishlist.length === 0 ? (
            <Typography>No wishlist places found.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Photo</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Price Level</TableCell>
                  <TableCell>Date Added</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedWishlist.map((place) => (
                  <TableRow key={place.id} hover>
                    <TableCell>
                      {place.photoReference ? (
                        <Avatar
                          variant="rounded"
                          src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=100&photoreference=${place.photoReference}&key=${API_KEY}`}
                          alt={place.name}
                          sx={{ width: 56, height: 56 }}
                        />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 56, height: 56 }}>
                          <PhotoCamera />
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell>{place.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={place.type.charAt(0).toUpperCase() + place.type.slice(1)}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{place.address || 'N/A'}</TableCell>
                    <TableCell>
                      <Rating value={place.rating} readOnly precision={0.1} />
                    </TableCell>
                    <TableCell>
                      {Array.from({ length: place.priceLevel }, (_, i) => (
                        <Chip
                          key={i}
                          label="$"
                          size="small"
                          sx={{ backgroundColor: theme.palette.success.light, mr: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>{new Date(place.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton edge="end" aria-label="edit" onClick={() => handleEditWishlistPlace(place.id)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteWishlistPlace(place.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Trip Planner */}
        <TripPlanner idToken={idToken} />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {/* Budget Planner */}
        <BudgetPlanner />
      </TabPanel>

      {/* Adjusted Tab Panels */}
      <TabPanel value={tabValue} index={5}>
        {/* Travel Statistics Content */}
        <TravelStatistics idToken={idToken} API_BASE_URL={API_BASE_URL} />
      </TabPanel>

      <TabPanel value={tabValue} index={6}>
        {/* Saved Itineraries Content */}
        <SavedItineraries idToken={idToken} API_BASE_URL={API_BASE_URL} />
      </TabPanel>

      <TabPanel value={tabValue} index={7}>
        {/* Payment & Subscriptions Content */}
        <PaymentSubscriptions idToken={idToken} API_BASE_URL={API_BASE_URL} />
      </TabPanel>

      <TabPanel value={tabValue} index={8}>
        {/* Support & Help Content */}
        <SupportHelp idToken={idToken} API_BASE_URL={API_BASE_URL} />
      </TabPanel>

      {/* Wishlist Place Dialog */}
      <Dialog open={wishlistDialogOpen} onClose={handleWishlistDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>{wishlistDialogMode === 'add' ? 'Add Wishlist Place' : 'Edit Wishlist Place'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth variant="standard">
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                label="Type"
                name="type"
                value={wishlistPlaceData.type}
                onChange={handleTypeChange}
              >
                <MenuItem value="car_rental">Car Rental</MenuItem>
                <MenuItem value="attraction">Attraction</MenuItem>
                <MenuItem value="flight">Flight</MenuItem>
                <MenuItem value="hotel">Hotel</MenuItem>
                <MenuItem value="restaurant">Restaurant</MenuItem>
                <MenuItem value="train_station">Train Station</MenuItem>
                <MenuItem value="subway_station">Subway Station</MenuItem>
                <MenuItem value="bus_station">Bus Station</MenuItem>
                <MenuItem value="transit_station">Transit Station</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Place ID"
              name="placeId"
              type="text"
              fullWidth
              variant="standard"
              value={wishlistPlaceData.placeId}
              onChange={handleWishlistPlaceDataChange}
              disabled={wishlistDialogMode === 'edit'} 
            />

            <TextField
              label="Name"
              name="name"
              type="text"
              fullWidth
              variant="standard"
              value={wishlistPlaceData.name}
              onChange={handleWishlistPlaceDataChange}
            />

            <TextField
              label="Address"
              name="address"
              type="text"
              fullWidth
              variant="standard"
              value={wishlistPlaceData.address}
              onChange={handleWishlistPlaceDataChange}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                name="rating"
                value={wishlistPlaceData.rating}
                onChange={handleRatingChange}
                precision={0.1}
              />
            </Box>

            <FormControl fullWidth variant="standard">
              <InputLabel id="price-level-label">Price Level</InputLabel>
              <Select
                labelId="price-level-label"
                label="Price Level"
                name="priceLevel"
                value={wishlistPlaceData.priceLevel}
                onChange={handlePriceLevelChange}
              >
                <MenuItem value={1}>$</MenuItem>
                <MenuItem value={2}>$$</MenuItem>
                <MenuItem value={3}>$$$</MenuItem>
                <MenuItem value={4}>$$$$</MenuItem>
                <MenuItem value={5}>$$$$$</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Photo Reference"
              name="photoReference"
              type="text"
              fullWidth
              variant="standard"
              value={wishlistPlaceData.photoReference}
              onChange={handlePhotoReferenceChange}
              helperText="Optional: Provide a Google Place Photo Reference"
            />

            {wishlistError && <Alert severity="error">{wishlistError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleWishlistDialogClose}
            sx={{
              textTransform: 'none',
              transition: 'background-color 0.3s, color 0.3s',
              '&:hover': {
                backgroundColor: theme.palette.grey[300],
              },
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveWishlistPlace}
            variant="contained"
            color="primary"
            sx={{
              textTransform: 'none',
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            {wishlistDialogMode === 'add' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile;
