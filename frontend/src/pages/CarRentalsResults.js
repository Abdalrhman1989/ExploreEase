import React from 'react';
import '../styles/Results.css';

const CarRentalsResults = () => {
    return (
        <div className="results-container">
            <div className="search-summary">
                <div className="search-header">
                    <h2 className="title">Car Rentals Results</h2>
                    <div className="filters">
                        <span className="filter-item">Pickup: Copenhagen Airport</span>
                        <span className="filter-item">Dates: 28 Sept - 5 Oct</span>
                        <span className="filter-item">Driver's age: 30</span>
                    </div>
                </div>
                <div className="popular-filters">
                    <p>Showing 50 results</p>
                    <div className="filter-options">
                        <label className="filter-checkbox"><input type="checkbox" /> Free cancellation</label>
                        <label className="filter-checkbox"><input type="checkbox" /> Unlimited mileage</label>
                        <label className="filter-checkbox"><input type="checkbox" /> Automatic transmission</label>
                    </div>
                </div>
            </div>

            <div className="results-section">
                <div className="result-card">
                    <div className="car-details">
                        <h3>Compact Car</h3>
                        <p>4 passengers, 2 bags, Automatic transmission</p>
                    </div>
                    <div className="price-section">
                        <span className="price">$45 per day</span>
                        <button className="view-details-btn">View Details</button>
                    </div>
                </div>
                {/* Repeat result-card for additional car rental options */}
            </div>
        </div>
    );
};

export default CarRentalsResults;