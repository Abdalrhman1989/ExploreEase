// src/test/Login.test.js

// 1. Mock axios
jest.mock('axios');

// 2. Mock firebase/auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
}));

// 3. Mock firebase.js
jest.mock('../firebase', () => ({
  auth: {}, // Mocked auth object
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
import Login from '../pages/Login';
import axios from 'axios';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

describe('Login Component', () => {
  const mockNavigate = jest.fn();

  beforeAll(() => {
    // Mock global.alert (redundant if already mocked in jest.setup.js, but safe)
    global.alert = jest.fn();
  });

  beforeEach(() => {
    // Reset mocks before each test
    useNavigate.mockReturnValue(mockNavigate);
    signInWithEmailAndPassword.mockClear();
    signInWithPopup.mockClear();
    axios.get.mockClear();
    axios.post.mockClear();
    mockNavigate.mockClear();
    global.alert.mockClear();
  });

  test('renders the login form', () => {
    render(<Login />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Register here/i })).toBeInTheDocument();
  });

  test('shows error when email or password is missing', async () => {
    render(<Login />);

    // Submit the form without entering email and password
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Please provide both email and password');
    });
  });

  test('handles successful email/password login and navigates based on role', async () => {
    // Mock successful Firebase sign-in
    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: 'test-uid',
        getIdToken: jest.fn().mockResolvedValue('test-id-token'),
      },
    });

    // Mock successful backend GET /api/protected/dashboard
    axios.get.mockResolvedValueOnce({
      data: {
        user: {
          UserType: 'Admin',
        },
      },
    });

    render(<Login />);

    // Fill the form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Assert Firebase signInWithEmailAndPassword was called correctly
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        {}, // Mock auth object from mocked firebase/auth
        'admin@example.com',
        'password123'
      );
    });

    // Assert axios GET was called correctly using environment variable
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/protected/dashboard`,
        {
          headers: {
            Authorization: 'Bearer test-id-token',
          },
        }
      );
    });

    // Assert navigation to /admin/dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  test('handles email/password login with wrong password', async () => {
    // Mock Firebase error for wrong password
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/wrong-password' });

    render(<Login />);

    // Fill the form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Assert Firebase signInWithEmailAndPassword was called correctly
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        {}, // Mock auth object from mocked firebase/auth
        'user@example.com',
        'wrongpassword'
      );
    });

    // Assert alert with incorrect password message
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Incorrect password.');
    });
  });

  test('handles email/password login with user not found', async () => {
    // Mock Firebase error for user not found
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/user-not-found' });

    render(<Login />);

    // Fill the form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'nonexistent@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Assert Firebase signInWithEmailAndPassword was called correctly
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        {}, // Mock auth object from mocked firebase/auth
        'nonexistent@example.com',
        'password123'
      );
    });

    // Assert alert with user not found message
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('No user found with this email.');
    });
  });

  test('handles email/password login with invalid email format', async () => {
    // Mock Firebase error for invalid email
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/invalid-email' });

    render(<Login />);

    // Fill the form with invalid email
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Assert Firebase signInWithEmailAndPassword was called correctly
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        {}, // Mock auth object from mocked firebase/auth
        'invalid-email',
        'password123'
      );
    });

    // Assert alert with invalid email format message
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Invalid email format.');
    });
  });

  test('handles generic email/password login error', async () => {
    // Mock Firebase error for generic failure
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Generic login error'));

    render(<Login />);

    // Fill the form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Assert Firebase signInWithEmailAndPassword was called correctly
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        {}, // Mock auth object from mocked firebase/auth
        'user@example.com',
        'password123'
      );
    });

    // Assert alert with generic error message
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to log in. Please try again.');
    });
  });

  test('handles successful Google login, synchronization, and navigates based on role', async () => {
    // Mock GoogleAuthProvider instance
    const mockGoogleProvider = {};
    GoogleAuthProvider.mockImplementation(() => mockGoogleProvider);

    // Mock successful Firebase Google sign-in
    signInWithPopup.mockResolvedValueOnce({
      user: {
        uid: 'google-test-uid',
        displayName: 'Google User',
        email: 'googleuser@example.com',
        photoURL: 'http://example.com/photo.jpg',
        getIdToken: jest.fn().mockResolvedValue('google-test-id-token'),
      },
    });

    // Mock axios GET /api/protected/dashboard to throw 404 (user not found)
    axios.get.mockRejectedValueOnce({
      response: { status: 404 },
    });

    // Mock axios POST /api/auth/sync for synchronizing user
    axios.post.mockResolvedValueOnce({
      data: { message: 'User synchronized' },
    });

    // Mock axios GET /api/protected/dashboard to return user data after sync
    axios.get.mockResolvedValueOnce({
      data: {
        user: {
          UserType: 'BusinessAdministrator',
        },
      },
    });

    render(<Login />);

    // Click the Google login button
    fireEvent.click(screen.getByRole('button', { name: /Sign in with Google/i }));

    // Assert signInWithPopup was called correctly
    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledWith(
        {}, // Mock auth object from mocked firebase/auth
        mockGoogleProvider
      );
    });

    // Assert axios GET was called to check if user exists using environment variable
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/protected/dashboard`,
        {
          headers: {
            Authorization: 'Bearer google-test-id-token',
          },
        }
      );
    });

    // Assert axios POST was called to synchronize user using environment variable
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/sync`,
        {
          name: 'Google User',
          firstName: '',
          lastName: '',
          email: 'googleuser@example.com',
          phoneNumber: '',
          userType: 'User',
          profilePicture: 'http://example.com/photo.jpg',
        },
        {
          headers: {
            Authorization: 'Bearer google-test-id-token',
          },
        }
      );
    });

    // Assert axios GET was called again to fetch updated user data using environment variable
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(axios.get).toHaveBeenLastCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/protected/dashboard`,
        {
          headers: {
            Authorization: 'Bearer google-test-id-token',
          },
        }
      );
    });

    // Assert navigation to /business/dashboard based on role
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/business/dashboard');
    });
  });

  test('handles Google login when user already exists and navigates based on role', async () => {
    // Mock GoogleAuthProvider instance
    const mockGoogleProvider = {};
    GoogleAuthProvider.mockImplementation(() => mockGoogleProvider);

    // Mock successful Firebase Google sign-in
    signInWithPopup.mockResolvedValueOnce({
      user: {
        uid: 'google-existing-uid',
        displayName: 'Existing Google User',
        email: 'existinggoogleuser@example.com',
        photoURL: 'http://example.com/photo-existing.jpg',
        getIdToken: jest.fn().mockResolvedValue('existing-google-id-token'),
      },
    });

    // Mock axios GET /api/protected/dashboard to return existing user data
    axios.get.mockResolvedValueOnce({
      data: {
        user: {
          UserType: 'User',
        },
      },
    });

    render(<Login />);

    // Click the Google login button
    fireEvent.click(screen.getByRole('button', { name: /Sign in with Google/i }));

    // Assert signInWithPopup was called correctly
    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledWith(
        {}, // Mock auth object from mocked firebase/auth
        mockGoogleProvider
      );
    });

    // Assert axios GET was called to check if user exists using environment variable
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/protected/dashboard`,
        {
          headers: {
            Authorization: 'Bearer existing-google-id-token',
          },
        }
      );
    });

    // Since user exists, axios POST /api/auth/sync should not be called
    expect(axios.post).not.toHaveBeenCalled();

    // Assert axios GET was called once to fetch user data
    expect(axios.get).toHaveBeenCalledTimes(1);

    // Assert navigation to home page based on role
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handles Google login error', async () => {
    // Mock GoogleAuthProvider instance
    const mockGoogleProvider = {};
    GoogleAuthProvider.mockImplementation(() => mockGoogleProvider);

    // Mock Firebase signInWithPopup to throw an error
    signInWithPopup.mockRejectedValueOnce(new Error('Google login failed'));

    render(<Login />);

    // Click the Google login button
    fireEvent.click(screen.getByRole('button', { name: /Sign in with Google/i }));

    // Assert signInWithPopup was called correctly
    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledWith(
        {}, // Mock auth object from mocked firebase/auth
        mockGoogleProvider
      );
    });

    // Assert alert with generic Google login error message
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to log in with Google. Please try again.');
    });

    // Assert axios GET and POST were not called
    expect(axios.get).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();

    // Assert navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('handles backend synchronization error during Google login', async () => {
    // Mock GoogleAuthProvider instance
    const mockGoogleProvider = {};
    GoogleAuthProvider.mockImplementation(() => mockGoogleProvider);

    // Mock successful Firebase Google sign-in
    signInWithPopup.mockResolvedValueOnce({
      user: {
        uid: 'google-error-sync-uid',
        displayName: 'Google Error Sync User',
        email: 'googleerrorsync@example.com',
        photoURL: 'http://example.com/photo-error-sync.jpg',
        getIdToken: jest.fn().mockResolvedValue('google-error-sync-id-token'),
      },
    });

    // Mock axios GET /api/protected/dashboard to throw 404 (user not found)
    axios.get.mockRejectedValueOnce({
      response: { status: 404 },
    });

    // Mock axios POST /api/auth/sync to throw an error
    axios.post.mockRejectedValueOnce({
      response: {
        data: { message: 'Synchronization failed' },
      },
    });

    render(<Login />);

    // Click the Google login button
    fireEvent.click(screen.getByRole('button', { name: /Sign in with Google/i }));

    // Assert signInWithPopup was called correctly
    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledWith(
        {}, // Mock auth object from mocked firebase/auth
        mockGoogleProvider
      );
    });

    // Assert axios GET was called to check if user exists using environment variable
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/protected/dashboard`,
        {
          headers: {
            Authorization: 'Bearer google-error-sync-id-token',
          },
        }
      );
    });

    // Assert axios POST was called to synchronize user using environment variable
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/sync`,
        {
          name: 'Google Error Sync User',
          firstName: '',
          lastName: '',
          email: 'googleerrorsync@example.com',
          phoneNumber: '',
          userType: 'User',
          profilePicture: 'http://example.com/photo-error-sync.jpg',
        },
        {
          headers: {
            Authorization: 'Bearer google-error-sync-id-token',
          },
        }
      );
    });

    // Assert alert with synchronization error message
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Synchronization failed');
    });

    // Assert navigation was not called due to synchronization error
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
