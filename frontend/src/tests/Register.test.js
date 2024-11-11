// 1. Mock axios
jest.mock('axios');

// 2. Mock firebase/auth
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

// 3. Mock firebase.js
jest.mock('../firebase', () => ({
  auth: {}, 
  db: {},   
}));

// 4. Mock react-router-dom useNavigate
import { useNavigate } from 'react-router-dom';
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// 5. Now import the necessary modules
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../pages/Register';
import axios from 'axios';
import { createUserWithEmailAndPassword } from 'firebase/auth';

describe('Register Component', () => {
  const mockNavigate = jest.fn();

  beforeAll(() => {
    // Mock global.alert (redundant if already mocked in jest.setup.js, but safe)
    global.alert = jest.fn();
  });

  beforeEach(() => {
    // Reset mocks before each test
    useNavigate.mockReturnValue(mockNavigate);
    createUserWithEmailAndPassword.mockClear();
    axios.post.mockClear();
    mockNavigate.mockClear();
    global.alert.mockClear();
  });

  test('renders the registration form', () => {
    render(<Register />);
    expect(screen.getByLabelText('User Name')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByLabelText('User Type')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  test('shows error when passwords do not match', async () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Passwords do not match!');
    });
  });

  test('registers user and navigates correctly for User role', async () => {
    // Mock successful Firebase registration
    createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: 'test-uid',
        getIdToken: () => Promise.resolve('test-id-token'),
      },
    });

    // Mock successful backend synchronization
    axios.post.mockResolvedValueOnce({ data: {} });

    render(<Register />);

    // Fill the form
    fireEvent.change(screen.getByLabelText('User Name'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'User' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'testuser@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText('User Type'), {
      target: { value: 'User' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Assert Firebase Authentication was called correctly
    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        {}, // Mock auth object from mocked firebase.js
        'testuser@example.com',
        'password123'
      );
    });

    // Assert Backend Synchronization was called correctly using the environment variable
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/sync`,
        {
          name: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          email: 'testuser@example.com',
          phoneNumber: '1234567890',
          userType: 'User',
        },
        {
          headers: { Authorization: 'Bearer test-id-token' },
        }
      );
    });

    // Assert Navigation after successful registration
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handles Firebase registration error', async () => {
    // Mock Firebase error for email already in use
    createUserWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });

    render(<Register />);

    // Fill the form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'existinguser@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Assert alert was called with the correct message
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Email is already in use. Please try logging in.');
    });
  });

  test('handles backend registration error', async () => {
    // Mock successful Firebase registration
    createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: 'test-uid',
        getIdToken: () => Promise.resolve('test-id-token'),
      },
    });

    // Mock backend error
    axios.post.mockRejectedValueOnce({
      response: {
        data: { message: 'Backend error message' },
      },
    });

    render(<Register />);

    // Fill the form
    fireEvent.change(screen.getByLabelText('User Name'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'User' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'testuser@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText('User Type'), {
      target: { value: 'User' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Assert Backend Synchronization was called correctly using the environment variable
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/sync`,
        {
          name: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          email: 'testuser@example.com',
          phoneNumber: '1234567890',
          userType: 'User',
        },
        {
          headers: { Authorization: 'Bearer test-id-token' },
        }
      );
    });

    // Assert alert was called with the backend error message
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Backend error message');
    });
  });
});
