jest.mock('react-toastify/dist/ReactToastify.css', () => {});
jest.mock('../styles/ManageRestaurants.css', () => {});

import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import ManageRestaurants from '../pages/ManageRestaurants';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';

// Mock user with a resolved ID token promise
const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mockedToken'), // Ensure token is available
  isAuthenticated: true,
  userRole: 'Admin',
};

const renderWithAuth = (ui, { providerProps }) => {
  return render(
    <AuthContext.Provider value={providerProps}>
      {ui}
      <ToastContainer />
    </AuthContext.Provider>
  );
};

describe('ManageRestaurants Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    await act(async () => {
      renderWithAuth(<ManageRestaurants />, { providerProps: mockUser });
    });

    expect(screen.getByText('Manage Restaurants')).toBeInTheDocument();
  });

  it('displays "No restaurants found" when there are no restaurants', async () => {
    await act(async () => {
      renderWithAuth(<ManageRestaurants />, { providerProps: mockUser });
    });

    expect(screen.getByText('No restaurants found.')).toBeInTheDocument();
  });

  it('renders the search input field', async () => {
    await act(async () => {
      renderWithAuth(<ManageRestaurants />, { providerProps: mockUser });
    });

    expect(screen.getByPlaceholderText('Search by name, location, or cuisine')).toBeInTheDocument();
  });

  it('renders "Add New Restaurant" button with correct link', async () => {
    await act(async () => {
      renderWithAuth(<ManageRestaurants />, { providerProps: mockUser });
    });

    const addButton = screen.getByRole('link', { name: /Add New Restaurant/i });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute('href', '/business/restaurants/add');
  });

  it('renders table headers correctly', async () => {
    await act(async () => {
      renderWithAuth(<ManageRestaurants />, { providerProps: mockUser });
    });

    const headers = ['Name', 'Location', 'Cuisine', 'Status', 'Actions'];
    headers.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('updates search input value when user types', async () => {
    await act(async () => {
      renderWithAuth(<ManageRestaurants />, { providerProps: mockUser });
    });

    const searchInput = screen.getByPlaceholderText('Search by name, location, or cuisine');
    fireEvent.change(searchInput, { target: { value: 'Italian' } });

    expect(searchInput.value).toBe('Italian');
  });
});
