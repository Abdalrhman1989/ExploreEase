import React from 'react';
import '../styles/Results.css';

const AttractionsResults = () => {
    return (
        <div className="results-container">
            <div className="search-summary">
                <div className="search-header">
                    <h2 className="title">Attractions Results</h2>
                    <div className="filters">
                        <span className="filter-item">Location: Vienna</span>
                        <span className="filter-item">Dates: 28 Sept - 5 Oct</span>
                    </div>
                </div>
                <div className="popular-filters">
                    <p>Showing 30 results</p>
                    <div className="filter-options">
                        <label className="filter-checkbox"><input type="checkbox" /> Guided tours</label>
                        <label className="filter-checkbox"><input type="checkbox" /> Skip the line</label>
                        <label className="filter-checkbox"><input type="checkbox" /> Free cancellation</label>
                    </div>
                </div>
            </div>

            <div className="results-section">
                <div className="result-card">
                    <div className="attraction-details">
                        <h3>Vienna City Tour</h3>
                        <p>Explore the historic city of Vienna with a guided tour...</p>
                    </div>
                    <div className="price-section">
                        <span className="price">$30 per person</span>
                        <button className="view-details-btn">View Details</button>
                    </div>
                </div>
                {/* Repeat result-card for additional attraction options */}
            </div>
        </div>
    );
};

export default AttractionsResults;