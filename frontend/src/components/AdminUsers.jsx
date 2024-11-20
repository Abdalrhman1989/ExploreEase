import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Pagination,
  useMediaQuery,
  useTheme,
  Avatar,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { Edit, Delete, Add, ExpandMore, ExpandLess } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    PhoneNumber: '',
    UserType: 'User', 
    ProfilePicture: '',
  });
  const [createFormData, setCreateFormData] = useState({
    UserName: '',
    FirstName: '',
    LastName: '',
    Email: '',
    PhoneNumber: '',
    UserType: 'User', 
    Password: '',
    ProfilePicture: '',
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState([]);

  const fetchUsers = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No authentication token found. Please log in.');
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/users`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        toast.error(data.message || 'Failed to fetch users');
        if (response.status === 401) {
          navigate('/login');
        }
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = users.filter(
      (user) =>
        user.UserName.toLowerCase().includes(lowercasedFilter) ||
        user.FirstName.toLowerCase().includes(lowercasedFilter) ||
        user.LastName.toLowerCase().includes(lowercasedFilter) ||
        user.Email.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredUsers(filteredData);
    setCurrentPage(1);
  }, [searchTerm, users]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('authToken');
    setUpdating(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${deletingUserId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUsers(users.filter((user) => user.UserID !== deletingUserId));
        setFilteredUsers(filteredUsers.filter((user) => user.UserID !== deletingUserId));
        setNotification({ open: true, message: 'User deleted successfully', severity: 'success' });
      } else {
        setNotification({ open: true, message: data.message || 'Failed to delete user', severity: 'error' });
      }
    } catch (error) {
      setNotification({ open: true, message: 'Failed to delete user', severity: 'error' });
    } finally {
      setUpdating(false);
      setConfirmDialogOpen(false);
      setDeletingUserId(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const token = localStorage.getItem('authToken');
    setUpdating(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ UserType: newRole }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUsers(users.map((user) => (user.UserID === data.user.UserID ? data.user : user)));
        setFilteredUsers(filteredUsers.map((user) => (user.UserID === data.user.UserID ? data.user : user)));
        setNotification({ open: true, message: 'User role updated successfully', severity: 'success' });
      } else {
        setNotification({ open: true, message: data.message || 'Failed to update user role', severity: 'error' });
      }
    } catch (error) {
      setNotification({ open: true, message: 'Failed to update user role', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  // Handle Edit Modal
  const openEditModal = (user) => {
    setCurrentUser(user);
    setEditFormData({
      FirstName: user.FirstName,
      LastName: user.LastName,
      Email: user.Email,
      PhoneNumber: user.PhoneNumber || '',
      UserType: user.UserType,
      ProfilePicture: user.ProfilePicture || '',
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setCurrentUser(null);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const submitEditForm = async () => {
    const token = localStorage.getItem('authToken');
    setUpdating(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${currentUser.UserID}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editFormData),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUsers(users.map((user) => (user.UserID === data.user.UserID ? data.user : user)));
        setFilteredUsers(filteredUsers.map((user) => (user.UserID === data.user.UserID ? data.user : user)));
        setNotification({ open: true, message: 'User updated successfully', severity: 'success' });
        closeEditModal();
      } else {
        setNotification({ open: true, message: data.message || 'Failed to update user', severity: 'error' });
      }
    } catch (error) {
      setNotification({ open: true, message: 'Failed to update user', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  // Handle Create Modal
  const openCreateModal = () => {
    setCreateFormData({
      UserName: '',
      FirstName: '',
      LastName: '',
      Email: '',
      PhoneNumber: '',
      UserType: 'User', 
      Password: '',
      ProfilePicture: '',
    });
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleCreateFormChange = (e) => {
    setCreateFormData({ ...createFormData, [e.target.name]: e.target.value });
  };

  const submitCreateForm = async () => {
    const token = localStorage.getItem('authToken');
    setUpdating(true);

    // Validate required fields
    const { UserName, Password, FirstName, LastName, Email, UserType } = createFormData;
    if (!UserName || !Password || !FirstName || !LastName || !Email || !UserType) {
      setNotification({ open: true, message: 'Please fill in all required fields', severity: 'warning' });
      setUpdating(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/users`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createFormData),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUsers([...users, data.user]);
        setFilteredUsers([...filteredUsers, data.user]);
        setNotification({ open: true, message: 'User created successfully', severity: 'success' });
        closeCreateModal();
      } else {
        setNotification({ open: true, message: data.message || 'Failed to create user', severity: 'error' });
      }
    } catch (error) {
      setNotification({ open: true, message: 'Failed to create user', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  // Handle Row Expansion for Small Screens
  const toggleRowExpansion = (userId) => {
    setExpandedRows((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <Typography variant="h4" align="center" gutterBottom>
        Admin Users Management
      </Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Search Users"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button variant="contained" color="primary" startIcon={<Add />} onClick={openCreateModal}>
            Create User
          </Button>
        </Grid>
      </Grid>

      {/* Responsive Table or Cards based on screen size */}
      {isSmallScreen ? (
        <Grid container spacing={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4, width: '100%' }}>
              <CircularProgress />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ padding: 4, width: '100%' }}>
              <Alert severity="info">No users found.</Alert>
            </Box>
          ) : (
            currentUsers.map((user) => (
              <Grid item xs={12} key={user.UserID}>
                <Card>
                  <CardContent>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1">
                          <strong>UserID:</strong> {user.UserID}
                        </Typography>
                        <Typography variant="subtitle1">
                          <strong>UserName:</strong> {user.UserName}
                        </Typography>
                        <Typography variant="subtitle1">
                          <strong>Email:</strong> {user.Email}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1">
                          <strong>Name:</strong> {user.FirstName} {user.LastName}
                        </Typography>
                        <Typography variant="subtitle1">
                          <strong>Phone:</strong> {user.PhoneNumber || 'N/A'}
                        </Typography>
                        <Typography variant="subtitle1">
                          <strong>User Type:</strong> {user.UserType}
                        </Typography>
                        <Typography variant="subtitle1">
                          <strong>Account Created:</strong>{' '}
                          {new Date(user.AccountCreatedDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Edit User">
                      <IconButton color="primary" onClick={() => openEditModal(user)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton
                        color="error"
                        onClick={() => {
                          setDeletingUserId(user.UserID);
                          setConfirmDialogOpen(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle Details">
                      <IconButton onClick={() => toggleRowExpansion(user.UserID)}>
                        {expandedRows.includes(user.UserID) ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                  {expandedRows.includes(user.UserID) && (
                    <CardContent>
                      <Typography variant="body2">
                        <strong>Profile Picture:</strong>{' '}
                        {user.ProfilePicture ? (
                          <Avatar src={user.ProfilePicture} alt={user.UserName} />
                        ) : (
                          'N/A'
                        )}
                      </Typography>
                      <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                        <InputLabel id={`user-type-label-${user.UserID}`}>User Type</InputLabel>
                        <Select
                          labelId={`user-type-label-${user.UserID}`}
                          value={user.UserType}
                          label="User Type"
                          onChange={(e) => handleRoleChange(user.UserID, e.target.value)}
                        >
                          <MenuItem value="User">User</MenuItem>
                          <MenuItem value="Admin">Admin</MenuItem>
                          <MenuItem value="BusinessAdministrator">Business Administrator</MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                  )}
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      ) : (
        // Table Layout for Larger Screens
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ padding: 4 }}>
              <Alert severity="info">No users found.</Alert>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>UserID</TableCell>
                  <TableCell>UserName</TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>User Type</TableCell>
                  <TableCell>Profile Picture</TableCell>
                  <TableCell>Account Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentUsers.map((user) => (
                  <TableRow key={user.UserID} hover>
                    <TableCell>{user.UserID}</TableCell>
                    <TableCell>{user.UserName}</TableCell>
                    <TableCell>{user.FirstName}</TableCell>
                    <TableCell>{user.LastName}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>{user.PhoneNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <InputLabel id={`user-type-label-${user.UserID}`}>User Type</InputLabel>
                        <Select
                          labelId={`user-type-label-${user.UserID}`}
                          value={user.UserType}
                          label="User Type"
                          onChange={(e) => handleRoleChange(user.UserID, e.target.value)}
                        >
                          <MenuItem value="User">User</MenuItem>
                          <MenuItem value="Admin">Admin</MenuItem>
                          <MenuItem value="BusinessAdministrator">Business Administrator</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      {user.ProfilePicture ? (
                        <Avatar src={user.ProfilePicture} alt={user.UserName} />
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.AccountCreatedDate).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit User">
                        <IconButton color="primary" onClick={() => openEditModal(user)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton
                          color="error"
                          onClick={() => {
                            setDeletingUserId(user.UserID);
                            setConfirmDialogOpen(true);
                          }}
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
        </TableContainer>
      )}

      {/* Pagination */}
      {filteredUsers.length > usersPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
        </Box>
      )}

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onClose={closeEditModal} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="FirstName"
                  value={editFormData.FirstName}
                  onChange={handleEditFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="LastName"
                  value={editFormData.LastName}
                  onChange={handleEditFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="Email"
                  type="email"
                  value={editFormData.Email}
                  onChange={handleEditFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="PhoneNumber"
                  value={editFormData.PhoneNumber}
                  onChange={handleEditFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="edit-user-type-label">User Type</InputLabel>
                  <Select
                    labelId="edit-user-type-label"
                    label="User Type"
                    name="UserType"
                    value={editFormData.UserType}
                    onChange={handleEditFormChange}
                    required
                  >
                    <MenuItem value="User">User</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="BusinessAdministrator">Business Administrator</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Profile Picture URL"
                  name="ProfilePicture"
                  value={editFormData.ProfilePicture}
                  onChange={handleEditFormChange}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={submitEditForm} color="primary" variant="contained" disabled={updating}>
            {updating ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={createModalOpen} onClose={closeCreateModal} fullWidth maxWidth="sm">
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="User Name"
                  name="UserName"
                  value={createFormData.UserName}
                  onChange={handleCreateFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password"
                  name="Password"
                  type="password"
                  value={createFormData.Password}
                  onChange={handleCreateFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="FirstName"
                  value={createFormData.FirstName}
                  onChange={handleCreateFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="LastName"
                  value={createFormData.LastName}
                  onChange={handleCreateFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="Email"
                  type="email"
                  value={createFormData.Email}
                  onChange={handleCreateFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="PhoneNumber"
                  value={createFormData.PhoneNumber}
                  onChange={handleCreateFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="create-user-type-label">User Type</InputLabel>
                  <Select
                    labelId="create-user-type-label"
                    label="User Type"
                    name="UserType"
                    value={createFormData.UserType}
                    onChange={handleCreateFormChange}
                    required
                  >
                    <MenuItem value="User">User</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="BusinessAdministrator">Business Administrator</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Profile Picture URL"
                  name="ProfilePicture"
                  value={createFormData.ProfilePicture}
                  onChange={handleCreateFormChange}
                  fullWidth
                  helperText="Optional"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={submitCreateForm} color="primary" variant="contained" disabled={updating}>
            {updating ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={updating}>
            {updating ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsers;
