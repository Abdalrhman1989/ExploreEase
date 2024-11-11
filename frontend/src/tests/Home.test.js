// 1. Mock axios
jest.mock('axios');

// 2. Mock images to prevent actual loading
jest.mock('../assets/hotel.jpg', () => 'hotel.jpg');
jest.mock('../assets/flight.jpg', () => 'flight.jpg');
jest.mock('../assets/carrenter.jpg', () => 'carrenter.jpg');
jest.mock('../assets/train1.jpg', () => 'train1.jpg');
jest.mock('../assets/bus1.jpg', () => 'bus1.jpg');
jest.mock('../assets/Restaurant1.jpg', () => 'Restaurant1.jpg');
jest.mock('../assets/paris1.jpg', () => 'paris1.jpg');
jest.mock('../assets/newyork1.jpg', () => 'newyork1.jpg');
jest.mock('../assets/tokyo1.jpg', () => 'tokyo1.jpg');
jest.mock('../assets/london1.jpg', () => 'london1.jpg');

// 3. Mock Testimonials component
jest.mock('../components/Testimonials', () => () => <div data-testid="Testimonials" />);

// 4. Import necessary modules
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Home from '../pages/Home';
import axios from 'axios';
import userEvent from '@testing-library/user-event';

describe('Home Component', () => {
  beforeAll(() => {
    // Mock global.alert (already mocked in setupTests.js, but re-mocking if necessary)
    global.alert = jest.fn();
  });

  beforeEach(() => {
    // Reset mocks before each test
    axios.post.mockClear();
    axios.get.mockClear();
    global.alert.mockClear();
  });

  test('renders all sections correctly', () => {
    render(<Home />);

    // Hero Slider
    expect(screen.getByRole('region', { name: /hero slider/i })).toBeInTheDocument();
    expect(screen.getByTestId('hero-slide-title')).toBeInTheDocument();

    // Modify this line to expect multiple elements
    const hotelTextElements = screen.getAllByText(/find the best hotels and more/i);
    expect(hotelTextElements).toHaveLength(2); // Adjust the expected length if more instances exist

    expect(screen.getByTestId('hero-cta-button')).toBeInTheDocument();

    // Featured Services
    expect(screen.getByText(/Our Top Services/i)).toBeInTheDocument();
    expect(screen.getAllByTestId(/FaHotel|FaPlane|FaCar|FaTrain|FaBus|FaUtensils/)).toHaveLength(6);
    expect(screen.getAllByTestId(/service-cta-button-\d/)).toHaveLength(6);

    // Why Choose Us
    expect(screen.getByText(/Why Choose Us\?/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Best Prices|24\/7 Support|Global Reach|Trusted Partners/i)).toHaveLength(4);

    // Trending Destinations
    expect(screen.getByText(/Trending Destinations/i)).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /view of/i })).toHaveLength(4);
    expect(screen.getAllByTestId(/explore-button-\d/)).toHaveLength(4);

    // Testimonials
    expect(screen.getByTestId('Testimonials')).toBeInTheDocument();

    // Contact Us
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();

    // Newsletter Subscription
    expect(screen.getByText(/Stay Updated!/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  });

  test('cycles through slides every 5 seconds', () => {
    jest.useFakeTimers();
    render(<Home />);

    const initialSlideTitle = screen.getByTestId('hero-slide-title');
    expect(initialSlideTitle).toHaveTextContent(/explore stays/i);

    // Advance time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const nextSlideTitle = screen.getByTestId('hero-slide-title');
    expect(nextSlideTitle).toHaveTextContent(/book flights/i);

    // Advance time by another 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const thirdSlideTitle = screen.getByTestId('hero-slide-title');
    expect(thirdSlideTitle).toHaveTextContent(/rent a car/i);

    jest.useRealTimers();
  });

  test('submits contact form successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<Home />);

    // Fill the contact form
    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Your Email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Your Message/i), {
      target: { value: 'Hello, this is a test message.' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    // Assert axios.post was called correctly
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/contact`,
        {
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Hello, this is a test message.',
        }
      );
    });

    // Assert success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully!/i)).toBeInTheDocument();
    });

    // Assert form fields are cleared
    expect(screen.getByLabelText(/Your Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Your Email/i)).toHaveValue('');
    expect(screen.getByLabelText(/Your Message/i)).toHaveValue('');
  });

  test('handles contact form submission failure', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: false } });

    render(<Home />);

    // Fill the contact form
    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Your Email/i), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Your Message/i), {
      target: { value: 'This is another test message.' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    // Assert axios.post was called correctly
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/contact`,
        {
          name: 'Jane Doe',
          email: 'jane@example.com',
          message: 'This is another test message.',
        }
      );
    });

    // Assert failure message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to send message\. please try again later\./i)).toBeInTheDocument();
    });

    // Form fields should retain their values
    expect(screen.getByLabelText(/Your Name/i)).toHaveValue('Jane Doe');
    expect(screen.getByLabelText(/Your Email/i)).toHaveValue('jane@example.com');
    expect(screen.getByLabelText(/Your Message/i)).toHaveValue('This is another test message.');
  });

  test('handles contact form submission with network error', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    render(<Home />);

    // Fill the contact form
    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByLabelText(/Your Email/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Your Message/i), {
      target: { value: 'Testing network error.' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    // Assert axios.post was called correctly
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/contact`,
        {
          name: 'Alice',
          email: 'alice@example.com',
          message: 'Testing network error.',
        }
      );
    });

    // Assert error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/an error occurred\. please try again later\./i)).toBeInTheDocument();
    });

    // Form fields should retain their values
    expect(screen.getByLabelText(/Your Name/i)).toHaveValue('Alice');
    expect(screen.getByLabelText(/Your Email/i)).toHaveValue('alice@example.com');
    expect(screen.getByLabelText(/Your Message/i)).toHaveValue('Testing network error.');
  });

  test('subscribes to newsletter successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<Home />);

    // Fill the newsletter form
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'newsletter@example.com' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }));

    // Assert axios.post was called correctly
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/subscribe`,
        {
          email: 'newsletter@example.com',
        }
      );
    });

    // Assert success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/subscribed successfully!/i)).toBeInTheDocument();
    });

    // Assert form field is cleared
    expect(screen.getByLabelText(/Email Address/i)).toHaveValue('');
  });

  test('handles newsletter subscription failure', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: false, message: 'Invalid email.' } });

    render(<Home />);

    // Fill the newsletter form
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'invalid-email' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }));

    // Assert axios.post was called correctly
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/subscribe`,
        {
          email: 'invalid-email',
        }
      );
    });

    // Assert failure message is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid email\./i)).toBeInTheDocument();
    });

    // Form field should retain its value
    expect(screen.getByLabelText(/Email Address/i)).toHaveValue('invalid-email');
  });

  test('handles newsletter subscription with network error', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    render(<Home />);

    // Fill the newsletter form
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'networkerror@example.com' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }));

    // Assert axios.post was called correctly
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_URL}/api/subscribe`,
        {
          email: 'networkerror@example.com',
        }
      );
    });

    // Assert error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/an error occurred\. please try again later\./i)).toBeInTheDocument();
    });

    // Form field should retain its value
    expect(screen.getByLabelText(/Email Address/i)).toHaveValue('networkerror@example.com');
  });

  test('navigation links are correct', () => {
    render(<Home />);

    // Hero Slider CTA button
    expect(screen.getByTestId('hero-cta-button')).toHaveAttribute('href', '/stays');

    // Featured Services CTA buttons
    const serviceCTAButtons = screen.getAllByTestId(/service-cta-button-\d/);
    const expectedServiceLinks = [
      '/stays',
      '/flights',
      '/car-rentals',
      '/trains',
      '/buses',
      '/restaurants',
    ];

    serviceCTAButtons.forEach((button, index) => {
      expect(button).toHaveAttribute('href', expectedServiceLinks[index]);
    });

    // Explore buttons in Trending Destinations
    const exploreButtons = screen.getAllByTestId(/explore-button-\d/);
    const expectedExploreLinks = [
      '/destination/paris',
      '/destination/new york',
      '/destination/tokyo',
      '/destination/london',
    ];

    exploreButtons.forEach((button, index) => {
      expect(button).toHaveAttribute('href', expectedExploreLinks[index]);
    });
  });
});
