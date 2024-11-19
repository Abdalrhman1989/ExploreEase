import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import CarRentals from '../pages/CarRentals'; 
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '@testing-library/jest-dom';
import { ToastContainer } from 'react-toastify';
import userEvent from '@testing-library/user-event';

// Mock react-toastify to suppress toast notifications during tests
jest.mock('react-toastify', () => ({
  ...jest.requireActual('react-toastify'),
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Corrected Mock for @react-google-maps/api components
jest.mock('@react-google-maps/api', () => {
  const React = require('react');

  const GoogleMap = ({ onLoad, children }) => {
    React.useEffect(() => {
      if (onLoad) {
        const mockMap = {
          panTo: jest.fn(),
          setZoom: jest.fn(),
          // Add other mock methods if needed
        };
        onLoad(mockMap);
      }
    }, [onLoad]);

    return <div data-testid="google-map">{children}</div>;
  };

  const MarkerClusterer = ({ children }) => {
    const mockClusterer = {}; // Mock clusterer object
    return <div data-testid="marker-clusterer">{children(mockClusterer)}</div>;
  };

  const Marker = ({ onClick }) => <div data-testid="marker" onClick={onClick}></div>;

  const InfoWindow = ({ children, onCloseClick }) => (
    <div data-testid="info-window">
      <button onClick={onCloseClick}>Close</button>
      {children}
    </div>
  );

  const useLoadScript = () => ({
    isLoaded: true,
    loadError: false,
  });

  return { GoogleMap, Marker, MarkerClusterer, InfoWindow, useLoadScript };
});

// Mock react-icons/fa
jest.mock('react-icons/fa', () => ({
  FaCar: () => <div data-testid="fa-car" />,
}));

// Mock react-router-dom Link
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// Mock axios globally
jest.mock('axios');

describe('CarRentals Component', () => {
  const mockUser = {
    getIdToken: jest.fn().mockResolvedValue('mocked-token'),
    email: 'testuser@example.com',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
  };

  const renderComponent = (isAuthenticated = false, user = null) => {
    return render(
      <AuthContext.Provider value={{ user, isAuthenticated, loading: false }}>
        <CarRentals />
        <ToastContainer />
      </AuthContext.Provider>
    );
  };

  beforeAll(() => {
    // Mock environment variables
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY = 'mocked-key';
    process.env.REACT_APP_BACKEND_URL = 'http://localhost:3001';
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock implementation for axios.get
    axios.get.mockImplementation((url) => {
      if (url === `${process.env.REACT_APP_BACKEND_URL}/api/favorites`) {
        return Promise.resolve({
          data: {
            favorites: [
              {
                id: 'fav1',
                type: 'car_rental',
                placeId: '1',
                name: 'Favorite Car Rental',
                address: '456 Favorite Street',
                rating: 4.8,
                photoReference: 'fav_photo_ref',
              },
            ],
          },
        });
      }

      // Mock other GET requests if necessary
      return Promise.resolve({ data: {} });
    });

    // Mock scrollIntoView for all elements
    Element.prototype.scrollIntoView = jest.fn();

    // Mock navigator.geolocation
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementationOnce((success) =>
        success({
          coords: {
            latitude: 55.4038,
            longitude: 10.4024,
          },
        })
      ),
    };
    global.navigator.geolocation = mockGeolocation;

    // Initialize window.google if not already set
    if (!window.google) {
      window.google = {
        maps: {
          places: {
            PlacesService: jest.fn().mockImplementation(() => ({
              nearbySearch: jest.fn(),
              getDetails: jest.fn(),
            })),
            PlacesServiceStatus: {
              OK: 'OK',
            },
          },
          Geocoder: jest.fn().mockImplementation(() => ({
            geocode: jest.fn(),
          })),
          Size: jest.fn(),
        },
      };
    } else {
      // Reset mocks if window.google already exists
      window.google.maps.places.PlacesService.mockClear();
      window.google.maps.Geocoder.mockClear();
    }
  });

  test('renders banner correctly', () => {
    renderComponent();
    expect(screen.getByText('Discover Car Rental Companies')).toBeInTheDocument();
    expect(screen.getByText('Find and explore car rental options near you')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explore now/i })).toBeInTheDocument();
  });

  test('renders category items', () => {
    renderComponent();
    expect(screen.getByText('Explore by Type')).toBeInTheDocument();
    expect(screen.getByText('Car Rental Companies')).toBeInTheDocument();

    // Use getAllByTestId to handle multiple fa-car elements
    const faCarIcons = screen.getAllByTestId('fa-car');
    expect(faCarIcons.length).toBe(2); // Adjust based on actual number
  });

  test('clicking on a category triggers search', async () => {
    // Mock the PlacesService.nearbySearch
    const mockNearbySearch = jest.fn((request, callback) => {
      callback(
        [
          {
            place_id: '1',
            name: 'Test Car Rental',
            geometry: { location: { lat: () => 55.4038, lng: () => 10.4024 } },
            formatted_address: '123 Test Street',
            rating: 4.5,
            photos: [{ photo_reference: 'photo_ref' }],
          },
        ],
        'OK'
      );
    });

    window.google.maps.places.PlacesService.mockImplementation(() => ({
      nearbySearch: mockNearbySearch,
      getDetails: jest.fn(),
    }));

    renderComponent();

    // Click on the category using userEvent
    const category = screen.getByText('Car Rental Companies');
    await userEvent.click(category);

    // Wait for nearbySearch to be called
    await waitFor(() => {
      expect(mockNearbySearch).toHaveBeenCalled();
    });

    // Check if the marker is rendered
    const markers = await screen.findAllByTestId('marker');
    expect(markers.length).toBe(1);
  });

  test('renders search bar and performs search for Odense', async () => {
    // Mock geocoder.geocode
    const mockGeocode = jest.fn((request, callback) => {
      if (request.address === 'Odense') {
        callback(
          [
            {
              geometry: {
                location: {
                  lat: () => 55.4038,
                  lng: () => 10.4024,
                },
              },
            },
          ],
          'OK'
        );
      } else {
        callback([], 'ZERO_RESULTS');
      }
    });

    window.google.maps.Geocoder.mockImplementation(() => ({
      geocode: mockGeocode,
    }));

    // Mock nearbySearch to return a marker based on search
    const mockNearbySearch = jest.fn((request, callback) => {
      if (request.keyword === 'Odense') {
        callback(
          [
            {
              place_id: '2',
              name: 'Odense Car Rental',
              geometry: { location: { lat: () => 55.4040, lng: () => 10.4030 } },
              formatted_address: '789 Odense Street',
              rating: 4.7,
              photos: [{ photo_reference: 'odense_photo_ref' }],
            },
          ],
          'OK'
        );
      } else {
        callback([], 'ZERO_RESULTS');
      }
    });

    window.google.maps.places.PlacesService.mockImplementation(() => ({
      nearbySearch: mockNearbySearch,
      getDetails: jest.fn(),
    }));

    renderComponent();

    // Enter a search query using userEvent
    const searchInput = screen.getByPlaceholderText('Search for a city or rental company...');
    await userEvent.type(searchInput, 'Odense');

    // Submit the form using userEvent
    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);

    // Wait for geocode to be called
    await waitFor(() => {
      expect(mockGeocode).toHaveBeenCalledWith({ address: 'Odense' }, expect.any(Function));
    });

    // Wait for nearbySearch to be called
    await waitFor(() => {
      expect(mockNearbySearch).toHaveBeenCalled();
    });

    // Check if the marker is rendered
    const markers = await screen.findAllByTestId('marker');
    expect(markers.length).toBe(1);

    // Verify the marker details
    expect(screen.getByText('Odense Car Rental')).toBeInTheDocument();
  });

  test('renders map when loaded', () => {
    renderComponent();
    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });

  test('displays markers based on fetched data', async () => {
    // Mock the PlacesService.nearbySearch
    const mockNearbySearch = jest.fn((request, callback) => {
      callback(
        [
          {
            place_id: '1',
            name: 'Test Car Rental 1',
            geometry: { location: { lat: () => 55.4038, lng: () => 10.4024 } },
            formatted_address: '123 Test Street',
            rating: 4.5,
            photos: [{ photo_reference: 'photo_ref1' }],
          },
          {
            place_id: '2',
            name: 'Test Car Rental 2',
            geometry: { location: { lat: () => 55.4039, lng: () => 10.4025 } },
            formatted_address: '456 Test Avenue',
            rating: 4.7,
            photos: [{ photo_reference: 'photo_ref2' }],
          },
        ],
        'OK'
      );
    });

    window.google.maps.places.PlacesService.mockImplementation(() => ({
      nearbySearch: mockNearbySearch,
      getDetails: jest.fn(),
    }));

    renderComponent();

    // Click on the category using userEvent to trigger search
    const category = screen.getByText('Car Rental Companies');
    await userEvent.click(category);

    // Wait for the markers to be set
    await waitFor(() => {
      expect(mockNearbySearch).toHaveBeenCalled();
    });

    // Check if the markers are rendered
    const markers = await screen.findAllByTestId('marker');
    expect(markers.length).toBe(2);
  });

  test('clicking a marker opens InfoWindow', async () => {
    // Mock the PlacesService.nearbySearch and getDetails
    const mockNearbySearch = jest.fn((request, callback) => {
      callback(
        [
          {
            place_id: '1',
            name: 'Test Car Rental',
            geometry: { location: { lat: () => 55.4038, lng: () => 10.4024 } },
            formatted_address: '123 Test Street',
            rating: 4.5,
            photos: [{ photo_reference: 'photo_ref' }],
          },
        ],
        'OK'
      );
    });

    const mockGetDetails = jest.fn((request, callback) => {
      callback(
        {
          place_id: '1',
          name: 'Test Car Rental',
          formatted_address: '123 Test Street',
          geometry: { location: { lat: () => 55.4038, lng: () => 10.4024 } },
          rating: 4.5,
        },
        'OK'
      );
    });

    window.google.maps.places.PlacesService.mockImplementation(() => ({
      nearbySearch: mockNearbySearch,
      getDetails: mockGetDetails,
    }));

    renderComponent();

    // Click on the category using userEvent to trigger search
    const category = screen.getByText('Car Rental Companies');
    await userEvent.click(category);

    // Wait for the markers to be set
    await waitFor(() => {
      expect(mockNearbySearch).toHaveBeenCalled();
    });

    // Click on the marker using userEvent
    const marker = await screen.findByTestId('marker');
    await userEvent.click(marker);

    // Wait for getDetails to be called
    await waitFor(() => {
      expect(mockGetDetails).toHaveBeenCalledWith(
        { placeId: '1', fields: expect.any(Array) },
        expect.any(Function)
      );
    });

    // Check if InfoWindow is displayed
    const infoWindow = await screen.findByTestId('info-window');
    expect(infoWindow).toBeInTheDocument();

    // Use `within` to scope the queries to the InfoWindow
    const { getByText } = within(infoWindow);
    expect(getByText('Test Car Rental')).toBeInTheDocument();
    expect(getByText('Rating: 4.5 ⭐')).toBeInTheDocument();
    expect(getByText('123 Test Street')).toBeInTheDocument();
  });

  test('adds a car rental company to favorites when authenticated', async () => {
    // Mock axios.post to add a favorite
    axios.post.mockResolvedValueOnce({
      data: {
        favorite: {
          id: 'fav1',
          type: 'car_rental',
          placeId: '1',
          name: 'Test Car Rental',
          address: '123 Test Street',
          rating: 4.5,
          photoReference: 'photo_ref',
        },
      },
    });

    // Mock the PlacesService.nearbySearch and getDetails
    const mockNearbySearch = jest.fn((request, callback) => {
      callback(
        [
          {
            place_id: '1',
            name: 'Test Car Rental',
            geometry: { location: { lat: () => 55.4038, lng: () => 10.4024 } },
            formatted_address: '123 Test Street',
            rating: 4.5,
            photos: [{ photo_reference: 'photo_ref' }],
          },
        ],
        'OK'
      );
    });

    const mockGetDetails = jest.fn((request, callback) => {
      callback(
        {
          place_id: '1',
          name: 'Test Car Rental',
          formatted_address: '123 Test Street',
          geometry: { location: { lat: () => 55.4038, lng: () => 10.4024 } },
          rating: 4.5,
          photos: [{ photo_reference: 'photo_ref' }],
        },
        'OK'
      );
    });

    window.google.maps.places.PlacesService.mockImplementation(() => ({
      nearbySearch: mockNearbySearch,
      getDetails: mockGetDetails,
    }));

    renderComponent(true, mockUser);

    // Click on the category using userEvent to trigger search
    const category = screen.getByText('Car Rental Companies');
    await userEvent.click(category);

    // Wait for the markers to be set
    await waitFor(() => {
      expect(mockNearbySearch).toHaveBeenCalled();
    });

    // Click on the marker using userEvent
    const marker = await screen.findByTestId('marker');
    await userEvent.click(marker);

    // Wait for getDetails to be called
    await waitFor(() => {
      expect(mockGetDetails).toHaveBeenCalled();
    });

    // Click on "Add to Favorites" button using userEvent
    const addToFavoritesButton = await screen.findByRole('button', { name: /add to favorites/i });
    await userEvent.click(addToFavoritesButton);

    // Wait for axios.post to be called
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/favorites`,
        {
          type: 'car_rental',
          placeId: '1',
          name: 'Test Car Rental',
          address: '123 Test Street',
          rating: 4.5,
          photoReference: 'photo_ref',
        },
        expect.any(Object)
      );
    });

    // Check for success toast
    expect(require('react-toastify').toast.success).toHaveBeenCalledWith('Favorite added successfully!');
  }); 

});
