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
} from '@mui/material';
import { Edit, Delete, Add, PhotoCamera, Close } from '@mui/icons-material';

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
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
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
  const { isAuthenticated, userRole, user, idToken, loading } = useContext(AuthContext);
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

  // States for Order History
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // States for Trip History
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState(null);

  // States for Payment History
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState(null);

  // States for Profile Picture Upload
  const [profilePic, setProfilePic] = useState(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadPicError, setUploadPicError] = useState(null);
  const [uploadPicSuccess, setUploadPicSuccess] = useState(false);

  // States for Snackbar Notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' | 'error' | 'warning' | 'info'

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && idToken) {
        try {
          const response = await axios.get('http://localhost:3001/api/protected/dashboard', {
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
          console.error('Error fetching profile data:', error);
          setProfileError('Failed to load profile data.');
          setFetchingProfile(false);
        }
      }
    };

    fetchProfile();
  }, [user, idToken]);

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
      const response = await axios.put('http://localhost:3001/api/user/profile', userInfo, {
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
      console.error('Error updating user info:', error);
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
        const response = await axios.get('http://localhost:3001/api/user/favorites', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setFavPlaces(response.data.favorites);
      } catch (error) {
        console.error('Error fetching favorite places:', error);
        setFavError('Failed to load favorite places.');
      } finally {
        setFavLoading(false);
      }
    };

    fetchFavorites();
  }, [idToken]);

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
    setFavPlaceName(place.PlaceName);
    setCurrentFavId(place.FavoritePlaceID);
    setFavDialogOpen(true);
  };

  // Handle Delete Favorite Place
  const handleDeleteFavPlace = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/user/favorites/${id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setFavPlaces(favPlaces.filter(place => place.FavoritePlaceID !== id));
      setSnackbarMsg('Favorite place deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting favorite place:', error);
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
        const response = await axios.post('http://localhost:3001/api/user/favorites', { PlaceName: favPlaceName }, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setFavPlaces([...favPlaces, response.data.favorite]);
        setSnackbarMsg('Favorite place added successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else if (favDialogMode === 'edit') {
        const response = await axios.put(`http://localhost:3001/api/user/favorites/${currentFavId}`, { PlaceName: favPlaceName }, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setFavPlaces(favPlaces.map(place => place.FavoritePlaceID === currentFavId ? response.data.favorite : place));
        setSnackbarMsg('Favorite place updated successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
      setFavDialogOpen(false);
      setFavError(null);
    } catch (error) {
      console.error('Error saving favorite place:', error);
      setFavError('Failed to save favorite place.');
      setSnackbarMsg('Failed to save favorite place.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Fetch Order History
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/user/orders', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setOrders(response.data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrdersError('Failed to load order history.');
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [idToken]);

  // Fetch Trip History
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/user/trips', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setTrips(response.data.trips);
      } catch (error) {
        console.error('Error fetching trips:', error);
        setTripsError('Failed to load trip history.');
      } finally {
        setTripsLoading(false);
      }
    };

    fetchTrips();
  }, [idToken]);

  // Fetch Payment History
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/user/payments', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setPayments(response.data.payments);
      } catch (error) {
        console.error('Error fetching payments:', error);
        setPaymentsError('Failed to load payment history.');
      } finally {
        setPaymentsLoading(false);
      }
    };

    fetchPayments();
  }, [idToken]);

  // Handle Profile Picture Upload
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setUploadingPic(true);
      setUploadPicError(null);

      const formData = new FormData();
      formData.append('profilePicture', file);

      try {
        const response = await axios.post('http://localhost:3001/api/user/profile-picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${idToken}`,
          },
        });
        setProfileData(response.data.user);
        setSnackbarMsg('Profile picture updated successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error uploading profile picture:', error);
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Message */}
      {profileData && (
        <Typography variant="h4" gutterBottom>
          Welcome, {profileData.FirstName}!
        </Typography>
      )}

      {/* Tabs Navigation */}
      <Paper elevation={3}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="User Info" {...a11yProps(0)} />
          <Tab label="Order History" {...a11yProps(1)} />
          <Tab label="Trip History" {...a11yProps(2)} />
          <Tab label="Payment History" {...a11yProps(3)} />
          <Tab label="Favorite Places" {...a11yProps(4)} />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* User Information */}
        <Grid container spacing={2}>
          {/* Profile Picture */}
          <Grid item xs={12} sm={4} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Avatar
                alt="Profile Picture"
                src={profileData && profileData.ProfilePicture ? `http://localhost:3001/${profileData.ProfilePicture}` : '/default-profile.png'}
                sx={{ width: 120, height: 120, margin: 'auto' }}
              />
              <Box sx={{ mt: 2 }}>
                <label htmlFor="profile-pic-upload">
                  <input
                    accept="image/*"
                    id="profile-pic-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleProfilePicChange}
                  />
                  <Button variant="contained" component="span" startIcon={<PhotoCamera />} disabled={uploadingPic}>
                    {uploadingPic ? 'Uploading...' : 'Change Picture'}
                  </Button>
                </label>
                {uploadPicError && <Alert severity="error" sx={{ mt: 2 }}>{uploadPicError}</Alert>}
              </Box>
            </Paper>
          </Grid>

          {/* User Details */}
          <Grid item xs={12} sm={8} md={9}>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="FirstName"
                  value={userInfo.FirstName}
                  onChange={handleUserInfoChange}
                  fullWidth
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="LastName"
                  value={userInfo.LastName}
                  onChange={handleUserInfoChange}
                  fullWidth
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="Email"
                  value={userInfo.Email}
                  onChange={handleUserInfoChange}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="PhoneNumber"
                  value={userInfo.PhoneNumber}
                  onChange={handleUserInfoChange}
                  fullWidth
                  disabled={!editMode}
                />
              </Grid>
            </Grid>
            {userInfoError && <Alert severity="error" sx={{ mt: 2 }}>{userInfoError}</Alert>}
            <Box sx={{ mt: 2 }}>
              {!editMode ? (
                <Button variant="contained" color="primary" onClick={() => setEditMode(true)}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveUserInfo}
                    disabled={userInfoLoading}
                  >
                    {userInfoLoading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setEditMode(false);
                      setUserInfo({
                        FirstName: profileData.FirstName || '',
                        LastName: profileData.LastName || '',
                        Email: profileData.Email || '',
                        PhoneNumber: profileData.PhoneNumber || '',
                      });
                      setUserInfoError(null);
                    }}
                    sx={{ ml: 2 }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Order History */}
        <Typography variant="h6" gutterBottom>
          Order History
        </Typography>
        {ordersLoading ? (
          <CircularProgress />
        ) : ordersError ? (
          <Alert severity="error">{ordersError}</Alert>
        ) : orders.length === 0 ? (
          <Typography>No orders found.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Trip</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.OrderID}>
                  <TableCell>{order.OrderID}</TableCell>
                  <TableCell>{order.TripName}</TableCell>
                  <TableCell>${order.Amount}</TableCell>
                  <TableCell>{order.Status}</TableCell>
                  <TableCell>{new Date(order.OrderDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Trip History */}
        <Typography variant="h6" gutterBottom>
          Trip History
        </Typography>
        {tripsLoading ? (
          <CircularProgress />
        ) : tripsError ? (
          <Alert severity="error">{tripsError}</Alert>
        ) : trips.length === 0 ? (
          <Typography>No trips found.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Trip ID</TableCell>
                <TableCell>Destination</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trips.map(trip => (
                <TableRow key={trip.TripID}>
                  <TableCell>{trip.TripID}</TableCell>
                  <TableCell>{trip.Destination}</TableCell>
                  <TableCell>{new Date(trip.TripDate).toLocaleDateString()}</TableCell>
                  <TableCell>{trip.Status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Payment History */}
        <Typography variant="h6" gutterBottom>
          Payment History
        </Typography>
        {paymentsLoading ? (
          <CircularProgress />
        ) : paymentsError ? (
          <Alert severity="error">{paymentsError}</Alert>
        ) : payments.length === 0 ? (
          <Typography>No payments found.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Payment ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map(payment => (
                <TableRow key={payment.PaymentID}>
                  <TableCell>{payment.PaymentID}</TableCell>
                  <TableCell>${payment.Amount}</TableCell>
                  <TableCell>{payment.Method}</TableCell>
                  <TableCell>{payment.Status}</TableCell>
                  <TableCell>{new Date(payment.PaymentDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {/* Favorite Places */}
        <Typography variant="h6" gutterBottom>
          Favorite Places
        </Typography>
        {favLoading ? (
          <CircularProgress />
        ) : favError ? (
          <Alert severity="error">{favError}</Alert>
        ) : (
          <>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleAddFavPlace}
              sx={{ mb: 2 }}
            >
              Add Favorite Place
            </Button>
            {favPlaces.length === 0 ? (
              <Typography>No favorite places found.</Typography>
            ) : (
              <List>
                {favPlaces.map(place => (
                  <ListItem
                    key={place.FavoritePlaceID}
                    secondaryAction={
                      <>
                        <IconButton edge="end" aria-label="edit" onClick={() => handleEditFavPlace(place)}>
                          <Edit />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFavPlace(place.FavoritePlaceID)}>
                          <Delete />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText primary={place.PlaceName} />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}

        {/* Dialog for Adding/Editing Favorite Places */}
        <Dialog open={favDialogOpen} onClose={handleFavDialogClose}>
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
            {favError && <Alert severity="error" sx={{ mt: 2 }}>{favError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFavDialogClose}>Cancel</Button>
            <Button onClick={handleSaveFavPlace} variant="contained" color="primary">
              {favDialogMode === 'add' ? 'Add' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

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

      {/* Profile Picture Upload Error Alert */}
      {uploadPicError && <Alert severity="error" sx={{ mt: 2 }}>{uploadPicError}</Alert>}
    </Container>
  );
};

export default UserProfile;
