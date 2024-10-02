import React from 'react';
import '../styles/Results.css'; // Reuse the same CSS file or create a new one

const StaysResults = () => {
    return (
        <div className="results-container">
            <div className="search-summary">
                <div className="search-header">
                    <h2 className="title">Stays Results</h2>
                    <div className="filters">
                        <span className="filter-item">Location: Copenhagen</span>
                        <span className="filter-item">Dates: 28 Sept - 5 Oct</span>
                        <span className="filter-item">Guests: 2 adults</span>
                    </div>
                </div>
                <div className="popular-filters">
                    <p>Showing 120 results</p>
                    <div className="filter-options">
                        <label className="filter-checkbox"><input type="checkbox" /> Free cancellation</label>
                        <label className="filter-checkbox"><input type="checkbox" /> Breakfast included</label>
                        <label className="filter-checkbox"><input type="checkbox" /> 5-star hotels</label>
                    </div>
                </div>
            </div>

            <div className="results-section">
                <div className="result-card">
                    <div className="stay-details">
                        <h3>Hotel Example</h3>
                        <p>Located in central Copenhagen, this 5-star hotel offers...</p>
                    </div>
                    <div className="price-section">
                        <span className="price">$250 per night</span>
                        <button className="view-details-btn">View Details</button>
                    </div>
                </div>
                {/* Repeat result-card for additional stay options */}
            </div>
        </div>
    );
};

export default StaysResults;