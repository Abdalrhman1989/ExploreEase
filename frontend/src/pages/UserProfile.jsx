// src/pages/UserProfile.jsx

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
  List,
  ListItem,
  ListItemText,
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
} from '@mui/material';
import { Edit, Delete, Add, PhotoCamera } from '@mui/icons-material';
import TripPlanner from '../components/TripPlanner';
import '../styles/UserProfile.css'; // Ensure this is imported


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

  // States for Favorite Places Dialog
  const [favDialogOpen, setFavDialogOpen] = useState(false);
  const [favDialogMode, setFavDialogMode] = useState('add'); // 'add' or 'edit'
  const [favPlaceName, setFavPlaceName] = useState('');
  const [currentFavId, setCurrentFavId] = useState(null);
  const [favPlaces, setFavPlaces] = useState([]);
  const [favLoading, setFavLoading] = useState(true);
  const [favError, setFavError] = useState(null);

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
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' | 'error' | 'warning' | 'info'

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Fetch Favorite Places
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/favorites`, { // Corrected
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setFavPlaces(response.data.favorites);
      } catch (error) {
        console.error('Error fetching favorite places:', error.response ? error.response.data : error.message);
        setFavError('Failed to load favorite places.');
      } finally {
        setFavLoading(false);
      }
    };

    fetchFavorites();
  }, [idToken, API_BASE_URL]);

  // Handle Add Favorite Place
  const handleAddFavPlace = () => {
    setFavDialogMode('add');
    setFavPlaceName('');
    setCurrentFavId(null);
    setFavDialogOpen(true);
  };

  // Handle Edit Favorite Place
  const handleEditFavPlace = (place) => {
    setFavDialogMode('edit');
    setFavPlaceName(place.name);
    setCurrentFavId(place.FavoritePlaceID);
    setFavDialogOpen(true);
  };

  // Handle Delete Favorite Place
  const handleDeleteFavPlace = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/favorites/${id}`, { // Corrected
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setFavPlaces(favPlaces.filter((place) => place.FavoritePlaceID !== id));
      setSnackbarMsg('Favorite place deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting favorite place:', error.response ? error.response.data : error.message);
      setFavError('Failed to delete favorite place.');
      setSnackbarMsg('Failed to delete favorite place.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle Save Favorite Place
  const handleSaveFavPlace = async () => {
    if (!favPlaceName.trim()) {
      setFavError('Place name cannot be empty.');
      return;
    }

    try {
      if (favDialogMode === 'add') {
        const response = await axios.post(
          `${API_BASE_URL}/favorites`, // Corrected
          {
            type: 'attraction', // Adjust as needed or make dynamic
            placeId: `place_${Date.now()}`, // Example unique placeId
            name: favPlaceName,
            address: '', // Collect from user if needed
            rating: 0, // Default rating or collect from user
            priceLevel: 1, // Default or collect
            photoReference: '', // Collect if needed
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        setFavPlaces([...favPlaces, response.data.favorite]);
        setSnackbarMsg('Favorite place added successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else if (favDialogMode === 'edit') {
        const response = await axios.put(
          `${API_BASE_URL}/favorites/${currentFavId}`, // Corrected
          {
            name: favPlaceName,
            // Include other fields if necessary
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        setFavPlaces(
          favPlaces.map((place) =>
            place.FavoritePlaceID === currentFavId ? response.data.favorite : place
          )
        );
        setSnackbarMsg('Favorite place updated successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
      setFavDialogOpen(false);
      setFavError(null);
    } catch (error) {
      console.error('Error saving favorite place:', error.response ? error.response.data : error.message);
      setFavError('Failed to save favorite place.');
      setSnackbarMsg('Failed to save favorite place.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Fetch Trip History
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/trips`, { // Corrected
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
          `${API_BASE_URL}/user/profile-picture`,
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

  // Handle Favorite Place Dialog Close
  const handleFavDialogClose = () => {
    setFavDialogOpen(false);
    setFavError(null);
  };

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
          <Tab label="Favorite Places" {...a11yProps(2)} />
          <Tab label="Trip Planner" {...a11yProps(3)} />
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
                        transition: 'background-color 0.3s, color 0.3s',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.main,
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
        {/* Favorite Places */}
        <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Favorite Places</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddFavPlace}
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
          {favLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh' }}>
              <CircularProgress />
            </Box>
          ) : favError ? (
            <Alert severity="error">{favError}</Alert>
          ) : favPlaces.length === 0 ? (
            <Typography>No favorite places found.</Typography>
          ) : (
            <List>
              {favPlaces.map((place) => (
                <ListItem
                  key={place.FavoritePlaceID} // Ensure unique key
                  secondaryAction={
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton edge="end" aria-label="edit" onClick={() => handleEditFavPlace(place)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteFavPlace(place.FavoritePlaceID)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'background-color 0.3s',
                  }}
                >
                  <ListItemText primary={place.name} secondary={place.type} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Trip Planner */}
        <TripPlanner idToken={idToken} />
      </TabPanel>

      {/* Favorite Place Dialog */}
      <Dialog open={favDialogOpen} onClose={handleFavDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>{favDialogMode === 'add' ? 'Add Favorite Place' : 'Edit Favorite Place'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Place Name"
            type="text"
            fullWidth
            variant="standard"
            value={favPlaceName}
            onChange={(e) => setFavPlaceName(e.target.value)}
          />
          {/* Add more fields as necessary */}
          {favError && <Alert severity="error" sx={{ mt: 2 }}>{favError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleFavDialogClose}
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
            onClick={handleSaveFavPlace}
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
            {favDialogMode === 'add' ? 'Add' : 'Update'}
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
