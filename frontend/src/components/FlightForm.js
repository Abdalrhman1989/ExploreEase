import React, { useState, useEffect } from 'react';
import '../styles/FlightForm.css';

const FlightForm = () => {
  const [flightDetails, setFlightDetails] = useState({
    id: null,
    airline: '',
    flightNumber: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
  });

  const [flights, setFlights] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch initial data from the backend (mocked here)
    const fetchFlights = async () => {
      const mockFlights = [
        {
          id: 1,
          airline: 'Airline 1',
          flightNumber: 'AA123',
          origin: 'New York',
          destination: 'London',
          departureTime: '2024-08-30T10:00',
          arrivalTime: '2024-08-30T14:00',
          price: 500,
        },
        // Add more mock flights here
      ];
      setFlights(mockFlights);
    };
    fetchFlights();
  }, []);

  const handleChange = (e) => {
    setFlightDetails({ ...flightDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setFlights((prevFlights) =>
        prevFlights.map((flight) =>
          flight.id === flightDetails.id ? flightDetails : flight
        )
      );
      setIsEditing(false);
    } else {
      setFlights([
        ...flights,
        { ...flightDetails, id: flights.length + 1 },
      ]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFlightDetails({
      id: null,
      airline: '',
      flightNumber: '',
      origin: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      price: '',
    });
    setIsEditing(false);
  };

  const handleEdit = (flight) => {
    setFlightDetails(flight);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    setFlights(flights.filter((flight) => flight.id !== id));
  };

  return (
    <div className="flight-management">
      <form className="flight-form" onSubmit={handleSubmit}>
        <h2>{isEditing ? 'Edit Flight' : 'Add New Flight'}</h2>
        <input
          type="text"
          name="airline"
          placeholder="Airline"
          value={flightDetails.airline}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="flightNumber"
          placeholder="Flight Number"
          value={flightDetails.flightNumber}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="origin"
          placeholder="Origin"
          value={flightDetails.origin}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="destination"
          placeholder="Destination"
          value={flightDetails.destination}
          onChange={handleChange}
          required
        />
        <input
          type="datetime-local"
          name="departureTime"
          placeholder="Departure Time"
          value={flightDetails.departureTime}
          onChange={handleChange}
          required
        />
        <input
          type="datetime-local"
          name="arrivalTime"
          placeholder="Arrival Time"
          value={flightDetails.arrivalTime}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={flightDetails.price}
          onChange={handleChange}
          required
        />
        <div className="form-buttons">
          <button type="submit">{isEditing ? 'Update Flight' : 'Add Flight'}</button>
          <button type="button" onClick={resetForm}>
            Reset
          </button>
        </div>
      </form>

      <h2>Existing Flights</h2>
      <table className="flight-table">
        <thead>
          <tr>
            <th>Airline</th>
            <th>Flight Number</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>Departure</th>
            <th>Arrival</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight) => (
            <tr key={flight.id}>
              <td>{flight.airline}</td>
              <td>{flight.flightNumber}</td>
              <td>{flight.origin}</td>
              <td>{flight.destination}</td>
              <td>{new Date(flight.departureTime).toLocaleString()}</td>
              <td>{new Date(flight.arrivalTime).toLocaleString()}</td>
              <td>${flight.price}</td>
              <td>
                <button onClick={() => handleEdit(flight)}>Edit</button>
                <button onClick={() => handleDelete(flight.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FlightForm;
