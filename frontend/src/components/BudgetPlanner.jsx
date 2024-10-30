// src/components/BudgetPlanner.jsx

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
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
  MenuItem,
  Box,
  Snackbar,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useTheme, useMediaQuery } from '@mui/material';

const BudgetPlanner = () => {
  // State for Budget
  const [budget, setBudget] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [settingBudget, setSettingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState(null);

  // State for Expenses
  const [expenses, setExpenses] = useState([]);
  const [expenseError, setExpenseError] = useState(null);

  // State for Expense Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentExpense, setCurrentExpense] = useState(null);
  const [expenseData, setExpenseData] = useState({
    category: '',
    amount: '',
    description: '',
  });
  const [savingExpense, setSavingExpense] = useState(false);

  // State for Snackbar Notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' | 'error' | 'warning' | 'info'

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const CATEGORIES = [
    'Transportation',
    'Accommodation',
    'Food',
    'Entertainment',
    'Utilities',
    'Miscellaneous',
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

  // Load Budget and Expenses from Local Storage on Mount
  useEffect(() => {
    const storedBudget = localStorage.getItem('budget');
    if (storedBudget) {
      setBudget(parseFloat(storedBudget));
    }

    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }
  }, []);

  // Save Budget to Local Storage
  useEffect(() => {
    if (budget !== null) {
      localStorage.setItem('budget', budget.toString());
    }
  }, [budget]);

  // Save Expenses to Local Storage
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Handle Budget Input Change
  const handleBudgetInputChange = (e) => {
    setBudgetInput(e.target.value);
  };

  // Handle Set Budget
  const handleSetBudget = () => {
    const amount = parseFloat(budgetInput);
    if (isNaN(amount) || amount <= 0) {
      setBudgetError('Please enter a valid positive number.');
      return;
    }
    setSettingBudget(true);
    setTimeout(() => {
      setBudget(amount);
      setBudgetInput('');
      setBudgetError(null);
      setSettingBudget(false);
      setSnackbarMsg('Budget set successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }, 1000); // Simulate loading
  };

  // Handle Expense Change
  const handleExpenseChange = (e) => {
    setExpenseData({
      ...expenseData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Save Expense
  const handleSaveExpense = () => {
    const { category, amount, description } = expenseData;
    if (!category || !amount) {
      setExpenseError('Category and amount are required.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setExpenseError('Please enter a valid positive number for amount.');
      return;
    }

    setSavingExpense(true);
    setTimeout(() => {
      if (dialogMode === 'add') {
        const newExpense = {
          id: Date.now(),
          category,
          amount: parsedAmount,
          description,
        };
        setExpenses([...expenses, newExpense]);
        setSnackbarMsg('Expense added successfully!');
      } else if (dialogMode === 'edit') {
        const updatedExpenses = expenses.map((exp) =>
          exp.id === currentExpense.id ? { ...exp, category, amount: parsedAmount, description } : exp
        );
        setExpenses(updatedExpenses);
        setSnackbarMsg('Expense updated successfully!');
      }
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setDialogOpen(false);
      setSavingExpense(false);
      setExpenseError(null);
      setExpenseData({
        category: '',
        amount: '',
        description: '',
      });
      setCurrentExpense(null);
    }, 1000); // Simulate loading
  };

  // Handle Delete Expense
  const handleDeleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const updatedExpenses = expenses.filter((exp) => exp.id !== id);
      setExpenses(updatedExpenses);
      setSnackbarMsg('Expense deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  // Handle Edit Expense
  const handleEditExpense = (expense) => {
    setDialogMode('edit');
    setCurrentExpense(expense);
    setExpenseData({
      category: expense.category,
      amount: expense.amount,
      description: expense.description || '',
    });
    setDialogOpen(true);
  };

  // Handle Add Expense
  const handleAddExpense = () => {
    setDialogMode('add');
    setExpenseData({
      category: '',
      amount: '',
      description: '',
    });
    setExpenseError(null);
    setDialogOpen(true);
  };

  // Handle Snackbar Close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Calculate Totals
  const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const remainingBudget = budget !== null ? budget - totalSpent : 0;

  // Prepare Data for Pie Chart
  const chartData = CATEGORIES.map((category, index) => {
    const total = expenses
      .filter((exp) => exp.category === category)
      .reduce((acc, exp) => acc + exp.amount, 0);
    return { name: category, value: total };
  }).filter((data) => data.value > 0); // Remove categories with 0 value

  return (
    <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Budget Planner
      </Typography>

      {/* Set Budget Section */}
      {budget === null ? (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Set Your Total Budget:
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                label="Total Budget ($)"
                variant="outlined"
                fullWidth
                value={budgetInput}
                onChange={handleBudgetInputChange}
                error={Boolean(budgetError)}
                helperText={budgetError}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSetBudget}
                fullWidth
                disabled={settingBudget}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  textTransform: 'none',
                  transition: 'background-color 0.3s',
                  height: '100%',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                {settingBudget ? <CircularProgress size={24} /> : 'Set Budget'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1">Total Budget: ${budget.toFixed(2)}</Typography>
          <Typography variant="subtitle1">Total Spent: ${totalSpent.toFixed(2)}</Typography>
          <Typography variant="subtitle1">Remaining Budget: ${remainingBudget.toFixed(2)}</Typography>
        </Box>
      )}

      {/* Add Expense Button */}
      {budget !== null && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddExpense}
            sx={{
              textTransform: 'none',
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            Add Expense
          </Button>
        </Box>
      )}

      {/* Expenses Table */}
      {budget !== null && (
        <>
          {expenses.length === 0 ? (
            <Typography>No expenses recorded.</Typography>
          ) : (
            <Box sx={{ overflowX: 'auto', mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Amount ($)</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{expense.amount.toFixed(2)}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell align="right">
                        <IconButton aria-label="edit" onClick={() => handleEditExpense(expense)}>
                          <Edit />
                        </IconButton>
                        <IconButton aria-label="delete" onClick={() => handleDeleteExpense(expense.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Pie Chart */}
          {chartData.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart width={isMobile ? 300 : 500} height={300}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </Box>
          )}
        </>
      )}

      {/* Expense Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'add' ? 'Add Expense' : 'Edit Expense'}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Category"
            name="category"
            value={expenseData.category}
            onChange={handleExpenseChange}
            fullWidth
            variant="standard"
            margin="dense"
            sx={{ mb: 2 }}
          >
            {CATEGORIES.map((category, index) => (
              <MenuItem key={index} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Amount ($)"
            name="amount"
            type="number"
            fullWidth
            variant="standard"
            value={expenseData.amount}
            onChange={handleExpenseChange}
            sx={{ mb: 2 }}
            inputProps={{ min: "0", step: "0.01" }}
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            type="text"
            fullWidth
            variant="standard"
            value={expenseData.description}
            onChange={handleExpenseChange}
            sx={{ mb: 2 }}
          />
          {expenseError && <Alert severity="error" sx={{ mt: 2 }}>{expenseError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogOpen(false)}
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
            onClick={handleSaveExpense}
            variant="contained"
            color="primary"
            disabled={savingExpense}
            sx={{
              textTransform: 'none',
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            {savingExpense ? <CircularProgress size={24} /> : dialogMode === 'add' ? 'Add' : 'Update'}
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
    </Paper>
  );
};

export default BudgetPlanner;
