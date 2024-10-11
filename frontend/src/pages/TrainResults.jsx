// src/pages/TrainResults.jsx
import React from 'react';
import '../styles/TrainResults.css';

const TrainResults = ({ data, onNext, onPrev, getPhotoUrl, addFavoriteToDB }) => {
  return (
    <section className="train-results">
      <h2>Available Trains</h2>
      <ul>
        {data.trains.map((train) => (
          <li key={train.id} className="train-item">
            <h3>{train.name}</h3>
            <p>Departure: {train.departure_time} from {train.departure_station}</p>
            <p>Arrival: {train.arrival_time} at {train.arrival_station}</p>
            <p>Duration: {train.duration}</p>
            <p>Price: ${train.price}</p>
            <button
              onClick={() => addFavoriteToDB(train)}
              className="book-button"
            >
              Add to Favorites
            </button>
          </li>
        ))}
      </ul>

      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={onPrev} disabled={data.offset === 0}>
          Previous
        </button>
        <button onClick={onNext} disabled={!data.hasMore}>
          Next
        </button>
      </div>
    </section>
  );
};

export default TrainResults;
