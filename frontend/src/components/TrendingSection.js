import React from 'react';
import '../styles/TrendingSection.css';

const TrendingSection = ({ title, items }) => {
  return (
    <div className="trending-section">
      <h2>{title}</h2>
      <div className="trending-items">
        {items.map((item, index) => (
          <div key={index} className="trending-item">
            <img src={item.imageUrl} alt={item.name} />
            <h3>{item.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSection;
