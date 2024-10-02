// src/pages/TrainResults.js
import React from 'react';
import '../styles/TrainResults.css'; // Create corresponding CSS

const TrainResults = ({ data, onNext, onPrev }) => {
  return (
    <div className="train-results">
      <h2>Available Trains</h2>
      <ul>
        {data.trains.map((train) => (
          <li key={train.id} className="train-item">
            <h3>{train.name}</h3>
            <p>Departure: {train.departure_time}</p>
            <p>Arrival: {train.arrival_time}</p>
            <p>Duration: {train.duration}</p>
            <p>Price: ${train.price}</p>
            <button className="book-button">Book Now</button>
          </li>
        ))}
      </ul>
      <div className="pagination">
        <button onClick={onPrev} disabled={data.offset === 0}>Previous</button>
        <button onClick={onNext}>Next</button>
      </div>
    </div>
  );
};

export default TrainResults;
