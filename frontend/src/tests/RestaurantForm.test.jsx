jest.mock('react-datepicker/dist/react-datepicker.css', () => {});
jest.mock('react-toastify/dist/ReactToastify.css', () => {});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RestaurantForm from '../components/RestaurantForm';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';

// Mock axios for API calls
jest.mock('axios');

const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('mockedToken'),
};

const renderWithAuth = (ui, { providerProps }) => {
  return render(
    <AuthContext.Provider value={providerProps}>
      {ui}
      <ToastContainer />
    </AuthContext.Provider>
  );
};

describe('RestaurantForm Component', () => {
  it('renders without crashing', () => {
    renderWithAuth(<RestaurantForm />, { providerProps: { user: mockUser } });
    expect(screen.getByText('Add New Restaurant')).toBeInTheDocument();
  });
  
  it('updates fields correctly', () => {
    renderWithAuth(<RestaurantForm />, { providerProps: { user: mockUser } });

    fireEvent.change(screen.getByPlaceholderText('Restaurant Name'), { target: { value: 'Test Restaurant' } });
    fireEvent.change(screen.getByPlaceholderText('Location'), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByPlaceholderText('Cuisine'), { target: { value: 'Test Cuisine' } });
    fireEvent.change(screen.getByPlaceholderText('Price Range ($)'), { target: { value: '3' } });
    fireEvent.change(screen.getByPlaceholderText('Rating (1-5)'), { target: { value: '4.5' } });

    expect(screen.getByPlaceholderText('Restaurant Name').value).toBe('Test Restaurant');
    expect(screen.getByPlaceholderText('Location').value).toBe('Test Location');
    expect(screen.getByPlaceholderText('Cuisine').value).toBe('Test Cuisine');
    expect(screen.getByPlaceholderText('Price Range ($)').value).toBe('3');
    expect(screen.getByPlaceholderText('Rating (1-5)').value).toBe('4.5');
  });

  it('submits form successfully', async () => {
    axios.post.mockResolvedValue({ data: { message: 'Restaurant added successfully' } });

    renderWithAuth(<RestaurantForm />, { providerProps: { user: mockUser } });

    fireEvent.change(screen.getByPlaceholderText('Restaurant Name'), { target: { value: 'Test Restaurant' } });
    fireEvent.change(screen.getByPlaceholderText('Location'), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByPlaceholderText('Cuisine'), { target: { value: 'Test Cuisine' } });
    fireEvent.change(screen.getByPlaceholderText('Price Range ($)'), { target: { value: '3' } });
    fireEvent.change(screen.getByPlaceholderText('Rating (1-5)'), { target: { value: '4.5' } });
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Great food and ambiance' } });

    fireEvent.submit(screen.getByRole('button', { name: /Add Restaurant/i }));

    await waitFor(() => {
      expect(screen.getByText('Restaurant added successfully')).toBeInTheDocument();
    });
  });

  it('displays validation error on form submission failure', async () => {
    axios.post.mockRejectedValue({
      response: {
        data: { errors: [{ msg: 'Validation error' }] },
      },
    });

    renderWithAuth(<RestaurantForm />, { providerProps: { user: mockUser } });

    fireEvent.submit(screen.getByRole('button', { name: /Add Restaurant/i }));

    await waitFor(() => {
      expect(screen.getByText('Validation error')).toBeInTheDocument();
    });
  });
});
