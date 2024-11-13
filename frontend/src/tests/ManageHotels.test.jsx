// Import necessary libraries and mocks
import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import ManageHotels from '../pages/ManageHotels';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import { prettyDOM } from '@testing-library/react';

jest.mock('axios', () => ({
  get: jest.fn(),
  delete: jest.fn(),
}));

// Mock styles and external libraries
jest.mock('react-toastify/dist/ReactToastify.css', () => {});
jest.mock('../styles/ManageHotels.css', () => {});
jest.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children }) => <div>{children}</div>,
  Marker: () => <div>Marker</div>,
  useLoadScript: () => ({ isLoaded: true, loadError: null }),
  Autocomplete: ({ children }) => <div>{children}</div>,
}));

// Mock user context
const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mockedToken'),
  isAuthenticated: true,
  userRole: 'Admin',
};

// Render component with Auth context
const renderWithAuth = (ui, { providerProps }) => {
  return render(
    <AuthContext.Provider value={providerProps}>
      {ui}
      <ToastContainer />
    </AuthContext.Provider>
  );
};

describe('ManageHotels Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    await act(async () => {
      renderWithAuth(<ManageHotels />, { providerProps: mockUser });
    });

    expect(screen.getByText('Manage Hotels')).toBeInTheDocument();
  });

  

  it('displays "No hotels found" when there are no hotels', async () => {
    axios.get.mockResolvedValueOnce({ data: { hotels: [] } });

    await act(async () => {
      renderWithAuth(<ManageHotels />, { providerProps: mockUser });
    });

    expect(screen.getByText('No hotels found.')).toBeInTheDocument();
  });

  it('renders the search input field', async () => {
    await act(async () => {
      renderWithAuth(<ManageHotels />, { providerProps: mockUser });
    });

    expect(screen.getByPlaceholderText('Search by name, location, or type')).toBeInTheDocument();
  });

  it('renders "Add New Hotel" button with correct link', async () => {
    await act(async () => {
      renderWithAuth(<ManageHotels />, { providerProps: mockUser });
    });

    const addButton = screen.getByRole('link', { name: /Add New Hotel/i });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute('href', '/business/hotels/add');
  });
});
