import React from 'react';
import '../styles/Banner.css';

const Banner = ({ title, subtitle, buttonText, imageUrl }) => {
  return (
    <div className="banner" style={{ backgroundImage: `url(${imageUrl})` }}>
      <div className="banner-overlay">
        <div className="banner-content">
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <button className="banner-button">{buttonText}</button>
        </div>
      </div>
    </div>
  );
};

export default Banner;
