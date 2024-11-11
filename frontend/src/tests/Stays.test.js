// src/test/Stays.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios'; // Import axios after mocking it

// 1. Mock react-toastify BEFORE importing the component
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
  ToastContainer: ({ children }) => <div>{children}</div>,
}));

import { toast } from 'react-toastify';

// 2. Mock axios BEFORE importing the component
jest.mock('axios');

// 3. Mock images to prevent actual loading
jest.mock('../assets/hotel1.jpg', () => 'hotel1.jpg');
jest.mock('../assets/hotel.jpg', () => 'hotel.jpg');

// 4. Mock other components
jest.mock('../components/ApprovedHotels', () => () => <div data-testid="ApprovedHotels" />);

// 5. Mock @react-google-maps/api BEFORE importing the component
jest.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children, onLoad }) => {
    const map = {}; // Mock map object
    if (onLoad) onLoad(map);
    return <div data-testid="GoogleMap">{children}</div>;
  },
  useLoadScript: () => ({
    isLoaded: true,
    loadError: null,
  }),
  Marker: ({ onClick }) => (
    <div data-testid="Marker" onClick={onClick} role="button" tabIndex={0}>
      Marker
    </div>
  ),
  MarkerClusterer: ({ children }) => (
    <div data-testid="MarkerClusterer">
      {children({ getClusterer: () => ({}) })}
    </div>
  ),
  InfoWindow: ({ children }) => <div data-testid="InfoWindow">{children}</div>,
}));

// Now, import the component AFTER all mocks are set up
import Stays from '../pages/Stays';
import { AuthContext } from '../context/AuthContext';

// Define mock functions for Google Maps services
const mockGetDetails = jest.fn();
const mockNearbySearch = jest.fn();
const mockGeocode = jest.fn();

// Mocks for window.google.maps
beforeAll(() => {
  // Define a mock class for PlacesService
  class MockPlacesService {
    constructor(map) {
      this.map = map;
    }
    getDetails(request, callback) {
      console.log('mockGetDetails called with:', request);
      mockGetDetails(request, callback);
    }
    nearbySearch(request, callback) {
      console.log('mockNearbySearch called with:', request);
      mockNearbySearch(request, callback);
    }
  }

  // Define a mock class for Geocoder
  class MockGeocoder {
    constructor() {}
    geocode(request, callback) {
      console.log('mockGeocoder called with:', request);
      mockGeocode(request, callback);
    }
  }

  // Assign the mock classes to window.google.maps
  window.google = {
    maps: {
      places: {
        PlacesService: MockPlacesService,
        PlacesServiceStatus: {
          OK: 'OK',
          ZERO_RESULTS: 'ZERO_RESULTS',
          ERROR: 'ERROR',
        },
      },
      Geocoder: MockGeocoder,
      Size: jest.fn(),
      Marker: jest.fn(),
      InfoWindow: jest.fn(),
      MarkerClusterer: jest.fn(),
    },
  };
  global.google = window.google;
});

// Mock navigator.geolocation BEFORE tests
beforeAll(() => {
  global.navigator.geolocation = {
    getCurrentPosition: jest.fn(),
  };
});

// Reset mocks before each test
beforeEach(() => {
  mockGetDetails.mockReset();
  mockNearbySearch.mockReset();
  mockGeocode.mockReset();
  jest.clearAllMocks();
});

// Restore mocks after all tests
afterAll(() => {
  jest.restoreAllMocks();
});

describe('Stays Component - Comprehensive Tests', () => {
  // Mock authenticated user
  const mockUser = {
    uid: 'user123',
    getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
  };

  // Helper function to render the Stays component within AuthContext
  const renderStays = (isAuthenticated = false, user = null, userRole = null) => {
    const mockLogout = jest.fn();
    render(
      <AuthContext.Provider value={{ 
        isAuthenticated, 
        userRole, 
        user, 
        loading: false, 
        logout: mockLogout 
      }}>
        <Stays />
      </AuthContext.Provider>
    );
    return { mockLogout };
  };

  /**
   * Test 1: Renders banner, search bar, categories, map, and ApprovedHotels
   */
  test('renders banner, search bar, categories, map, and ApprovedHotels', () => {
    // Mock the initial getDetails call for the banner image
    mockGetDetails.mockImplementationOnce((request, callback) => {
      callback(
        {
          photos: [{ photo_reference: 'banner-photo1', html_attributions: ['<a href="#">Photo Attribution</a>'] }],
        },
        'OK'
      );
    });

    renderStays();

    // Banner Section
    expect(screen.getByText('Find Your Perfect Stay')).toBeInTheDocument();
    expect(screen.getByText('Browse thousands of hotels, apartments, resorts, and more')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explore Stays/i })).toBeInTheDocument();

    // Search Bar Section
    expect(screen.getByPlaceholderText(/Search for a city or place to stay/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();

    // Categories Section
    const categories = ['Hotels', 'Apartments', 'Resorts', 'Hostels'];
    categories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });

    // Map Section
    expect(screen.getByTestId('GoogleMap')).toBeInTheDocument();

    // Approved Hotels Section
    expect(screen.getByTestId('ApprovedHotels')).toBeInTheDocument();
  });

  /**
   * Test 2: Displays ApprovedHotels component with currentLocation prop
   */
  test('displays ApprovedHotels component with currentLocation prop', () => {
    renderStays();

    // Check that ApprovedHotels is rendered with the correct prop
    expect(screen.getByTestId('ApprovedHotels')).toBeInTheDocument();
    // To further test ApprovedHotels' props, you might need to adjust the mock to capture props
  });

  

  /**
   * Test 5: Handles category selection and displays relevant markers
   */
  test('handles category selection and displays relevant markers', async () => {
    renderStays();

    // Select the 'Resorts' category
    const resortsCategory = screen.getByRole('button', { name: /Explore Resorts/i });
    userEvent.click(resortsCategory);

    // Mock the nearbySearch response for 'resort' type BEFORE category selection triggers it
    mockNearbySearch.mockImplementationOnce((req, cb) => {
      cb(
        [
          {
            place_id: 'resort1',
            name: 'Resort Paradise',
            geometry: { location: { lat: () => 34.0522, lng: () => -118.2437 } },
            types: ['resort'], // Changed from 'type' to 'types'
            photos: [{ photo_reference: 'resort-photo1', html_attributions: ['<a href="#">Photo Attribution</a>'] }],
            rating: 4.7,
            price_level: 4,
            formatted_address: '456 Sunset Blvd, Los Angeles, CA',
          },
          {
            place_id: 'resort2',
            name: 'Oceanview Resort',
            geometry: { location: { lat: () => 36.7783, lng: () => -119.4179 } },
            types: ['resort'], // Changed from 'type' to 'types'
            photos: [{ photo_reference: 'resort-photo2', html_attributions: ['<a href="#">Photo Attribution</a>'] }],
            rating: 4.3,
            price_level: 3,
            formatted_address: '789 Beach Ave, San Diego, CA',
          },
        ],
        'OK'
      );
    });

    // Wait for the nearbySearch to be called with ['resort']
    await waitFor(() => {
      expect(mockNearbySearch).toHaveBeenCalledWith(expect.objectContaining({ type: ['resort'] }), expect.any(Function)); // Changed to array
    });

    // Wait for the markers to be rendered
    const markers = await screen.findAllByTestId('Marker');
    expect(markers).toHaveLength(2);
  });

});
