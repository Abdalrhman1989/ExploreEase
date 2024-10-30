// src/components/PaymentMethods.jsx

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  Radio,
  FormControlLabel,
  RadioGroup,
  Snackbar,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import axios from 'axios';
import * as Yup from 'yup';
import { useFormik } from 'formik';

const PaymentMethods = ({ idToken, API_BASE_URL }) => {
  const theme = useTheme();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentPayment, setCurrentPayment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const [paymentsRes, billingRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/payments/methods`, {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }),
          axios.get(`${API_BASE_URL}/api/payments/history`, {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }),
        ]);

        setPaymentMethods(paymentsRes.data.paymentMethods);
        setDefaultPaymentMethodId(paymentsRes.data.defaultPaymentMethodId);
        setBillingHistory(billingRes.data.billingHistory);
      } catch (err) {
        console.error('Error fetching payment data:', err.response ? err.response.data : err.message);
        setFetchError('Failed to load payment data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [idToken, API_BASE_URL]);

  const handleOpenDialog = (mode, payment = null) => {
    setDialogMode(mode);
    setCurrentPayment(payment);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    formik.resetForm();
  };

  const handleDeletePayment = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/payments/methods/${id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id));
      setSnackbar({ open: true, message: 'Payment method deleted successfully.', severity: 'success' });
    } catch (err) {
      console.error('Error deleting payment method:', err.response ? err.response.data : err.message);
      setSnackbar({ open: true, message: 'Failed to delete payment method.', severity: 'error' });
    }
  };

  const handleSetDefaultPaymentMethod = async (id) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/payments/methods/${id}/default`,
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setDefaultPaymentMethodId(id);
      setSnackbar({ open: true, message: 'Default payment method updated.', severity: 'success' });
    } catch (err) {
      console.error('Error setting default payment method:', err.response ? err.response.data : err.message);
      setSnackbar({ open: true, message: 'Failed to update default payment method.', severity: 'error' });
    }
  };

  // Formik for form handling and validation
  const formik = useFormik({
    initialValues: {
      cardHolder: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    },
    validationSchema: Yup.object({
      cardHolder: Yup.string().required('Card holder name is required.'),
      cardNumber: Yup.string()
        .required('Card number is required.')
        .matches(/^[0-9]{16}$/, 'Card number must be 16 digits.'),
      expiryDate: Yup.string()
        .required('Expiry date is required.')
        .matches(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, 'Expiry date must be in MM/YY format.'),
      cvv: Yup.string()
        .required('CVV is required.')
        .matches(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits.'),
    }),
    onSubmit: async (values) => {
      try {
        if (dialogMode === 'add') {
          const response = await axios.post(
            `${API_BASE_URL}/api/payments/methods`,
            values,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          setPaymentMethods([...paymentMethods, response.data.paymentMethod]);
          setSnackbar({ open: true, message: 'Payment method added successfully.', severity: 'success' });
        } else if (dialogMode === 'edit') {
          const response = await axios.put(
            `${API_BASE_URL}/api/payments/methods/${currentPayment.id}`,
            values,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          setPaymentMethods(
            paymentMethods.map((pm) => (pm.id === currentPayment.id ? response.data.paymentMethod : pm))
          );
          setSnackbar({ open: true, message: 'Payment method updated successfully.', severity: 'success' });
        }
        setDialogOpen(false);
        formik.resetForm();
      } catch (err) {
        console.error('Error saving payment method:', err.response ? err.response.data : err.message);
        setSnackbar({ open: true, message: 'Failed to save payment method.', severity: 'error' });
      }
    },
  });

  useEffect(() => {
    if (currentPayment && dialogMode === 'edit') {
      formik.setValues({
        cardHolder: currentPayment.cardHolder,
        cardNumber: currentPayment.cardNumber,
        expiryDate: currentPayment.expiryDate,
        cvv: '', // CVV should not be pre-filled
      });
    } else {
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPayment, dialogMode]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Payment Methods
      </Typography>
      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError}
        </Alert>
      )}

      {/* Payment Methods */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">Your Payment Methods</Typography>
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
            Add Payment Method
          </Button>
        </Box>
        {paymentMethods.length === 0 ? (
          <Typography>No payment methods added.</Typography>
        ) : (
          <RadioGroup
            value={defaultPaymentMethodId}
            onChange={(e) => handleSetDefaultPaymentMethod(e.target.value)}
          >
            {paymentMethods.map((pm) => (
              <Card key={pm.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      value={pm.id}
                      control={<Radio />}
                      label={
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {pm.cardHolder}
                        </Typography>
                      }
                    />
                  </Box>
                  <Typography variant="body2">
                    Card Number: **** **** **** {pm.cardNumber.slice(-4)}
                  </Typography>
                  <Typography variant="body2">Expiry Date: {pm.expiryDate}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleOpenDialog('edit', pm)}>
                    <Edit fontSize="small" /> Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDeletePayment(pm.id)}>
                    <Delete fontSize="small" /> Delete
                  </Button>
                </CardActions>
              </Card>
            ))}
          </RadioGroup>
        )}
      </Box>

      {/* Billing History */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Billing History
        </Typography>
        {billingHistory.length === 0 ? (
          <Typography>No billing history available.</Typography>
        ) : (
          <List>
            {billingHistory.map((bill) => (
              <React.Fragment key={bill.id}>
                <ListItem>
                  <ListItemText
                    primary={`$${bill.amount.toFixed(2)} - ${bill.description}`}
                    secondary={new Date(bill.date).toLocaleDateString()}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Payment Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'add' ? 'Add Payment Method' : 'Edit Payment Method'}</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate onSubmit={formik.handleSubmit}>
            <TextField
              margin="dense"
              label="Card Holder Name"
              name="cardHolder"
              type="text"
              fullWidth
              variant="standard"
              value={formik.values.cardHolder}
              onChange={formik.handleChange}
              error={formik.touched.cardHolder && Boolean(formik.errors.cardHolder)}
              helperText={formik.touched.cardHolder && formik.errors.cardHolder}
            />
            <TextField
              margin="dense"
              label="Card Number"
              name="cardNumber"
              type="text"
              fullWidth
              variant="standard"
              value={formik.values.cardNumber}
              onChange={formik.handleChange}
              error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
              helperText={formik.touched.cardNumber && formik.errors.cardNumber}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  margin="dense"
                  label="Expiry Date (MM/YY)"
                  name="expiryDate"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={formik.values.expiryDate}
                  onChange={formik.handleChange}
                  error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                  helperText={formik.touched.expiryDate && formik.errors.expiryDate}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  margin="dense"
                  label="CVV"
                  name="cvv"
                  type="password"
                  fullWidth
                  variant="standard"
                  value={formik.values.cvv}
                  onChange={formik.handleChange}
                  error={formik.touched.cvv && Boolean(formik.errors.cvv)}
                  helperText={formik.touched.cvv && formik.errors.cvv}
                />
              </Grid>
            </Grid>
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
            onClick={formik.handleSubmit}
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
            {dialogMode === 'add' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </Paper>
  );
};

export default PaymentMethods;
