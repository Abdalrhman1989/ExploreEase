import React, { useState, useEffect } from 'react';
import '../styles/SearchFlights.css';
import sampleFlight1 from '../assets/flight1.jpg';
import sampleFlight2 from '../assets/flight2.jpg';
import sampleFlight3 from '../assets/flight3.jpg';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SearchFlights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      const sampleFlights = [
        {
          id: 1,
          airline: 'Delta Airlines',
          origin: 'New York',
          destination: 'London',
          departureTime: '2024-09-10T08:00:00Z',
          arrivalTime: '2024-09-10T20:00:00Z',
          price: 500,
          imageUrl: sampleFlight1,
        },
        {
          id: 2,
          airline: 'United Airlines',
          origin: 'Los Angeles',
          destination: 'Tokyo',
          departureTime: '2024-09-11T09:00:00Z',
          arrivalTime: '2024-09-11T21:00:00Z',
          price: 650,
          imageUrl: sampleFlight2,
        },
        {
          id: 3,
          airline: 'Air France',
          origin: 'Paris',
          destination: 'Sydney',
          departureTime: '2024-09-12T10:00:00Z',
          arrivalTime: '2024-09-13T02:00:00Z',
          price: 700,
          imageUrl: sampleFlight3,
        },
      ];
      setFlights(sampleFlights);
      setLoading(false);
    };

    fetchFlights();
  }, []);

  const priceData = {
    labels: flights.map((flight) => flight.airline),
    datasets: [
      {
        label: 'Flight Prices',
        data: flights.map((flight) => flight.price),
        backgroundColor: ['rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="search-flights-page">
      <h1>Flight Search Results</h1>

      <div className="flight-results-section">
        {loading && <p>Loading...</p>}
        {!loading && flights.length > 0 && (
          <ul className="flight-results">
            {flights.map((flight) => (
              <li key={flight.id} className="flight-result">
                <img src={flight.imageUrl} alt={`${flight.airline} flight`} />
                <div className="flight-info">
                  <h3>{flight.airline}</h3>
                  <p>
                    {flight.origin} to {flight.destination}
                  </p>
                  <p>Departure: {new Date(flight.departureTime).toLocaleString()}</p>
                  <p>Arrival: {new Date(flight.arrivalTime).toLocaleString()}</p>
                  <p>Price: ${flight.price}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && flights.length === 0 && <p>No flights found. Please try again.</p>}
      </div>

      <div className="price-analysis-section">
        <h2>Price Analysis</h2>
        <Bar data={priceData} options={{ responsive: true }} />
      </div>

      <div className="booking-section">
        <h2>Ready to Book?</h2>
        <p>Choose your preferred flight and get ready to explore the world!</p>
        <button className="cta-button">Book Now</button>
      </div>

      <div className="reviews-section">
        <h2>Customer Reviews</h2>
        <div className="reviews">
          <div className="review">
            <p>"Excellent service and smooth booking process!"</p>
            <p>- John D.</p>
          </div>
          <div className="review">
            <p>"The best prices I've found for my trip to Japan."</p>
            <p>- Sarah L.</p>
          </div>
          <div className="review">
            <p>"Highly recommend for easy and reliable booking."</p>
            <p>- Emily R.</p>
          </div>
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq">
          <h3>How do I book a flight?</h3>
          <p>You can book a flight by selecting your preferred option and following the checkout process.</p>
        </div>
        <div className="faq">
          <h3>Can I cancel or change my booking?</h3>
          <p>Yes, cancellations and changes are allowed depending on the airline's policies.</p>
        </div>
        <div className="faq">
          <h3>Are there any hidden fees?</h3>
          <p>No, the prices shown are final and include all taxes and fees.</p>
        </div>
      </div>
    </div>
  );
};

export default SearchFlights;
