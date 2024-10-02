import React, { useState } from 'react';
import axios from 'axios';
import Banner from '../components/Banner';
import TrendingSection from '../components/TrendingSection';
import Footer from '../components/Footer';
import Map from '../components/Map'; 
import '../styles/Attractions.css';

const Attractions = () => {
  const [mapCenter, setMapCenter] = useState([48.8566, 2.3522]); // Default center for Paris
  const [mapZoom, setMapZoom] = useState(5);

  const trendingAttractions = [
    { name: "Eiffel Tower", imageUrl: require('../assets/eiffel-tower-paris-france-EIFFEL0217-6ccc3553e98946f18c893018d5b42bde.jpg') },
    { name: "Great Wall of China", imageUrl: require('../assets/the-great-wall-of-china.jpg') },
    { name: "Grand Canyon", imageUrl: require('../assets/shutterstock_97706066_1.avif') },
  ];

  const handleSearch = async (query) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setMapZoom(12);
      } else {
        alert('Location not found. Showing default location.');
        setMapCenter([48.8566, 2.3522]);
        setMapZoom(5);
      }
    } catch (error) {
      console.error('Error fetching the location data:', error);
      alert('An error occurred while searching for the location.');
    }
  };

  return (
    <div className="attractions">
      <Banner 
        title="Discover Attractions" 
        subtitle="Explore the world's best attractions" 
        buttonText="Explore Attractions"
        imageUrl={require('../assets/hotel.jpg')}
      />

      <div className="map-container">
        <div className="map-search-bar">
          <input
            type="text"
            placeholder="Search for a city or attraction..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(e.target.value);
              }
            }}
          />
          <button onClick={() => handleSearch(document.querySelector('.map-search-bar input').value)}>
            Search
          </button>
        </div>
        <Map center={mapCenter} zoom={mapZoom} />
      </div>

      <TrendingSection type="Attractions" items={trendingAttractions} />

      <div className="featured-categories">
        <h2>Featured Categories</h2>
        <div className="categories-grid">
          <div className="category-item">
            <img src={require('../assets/ejgcq0acumqaosd7kl26.webp')} alt="Adventure" />
            <h3>Adventure</h3>
          </div>
          <div className="category-item">
            <img src={require('../assets/1681811705644.jpeg')} alt="Cultural" />
            <h3>Cultural</h3>
          </div>
          <div className="category-item">
            <img src={require('../assets/pexels-souvenirpixels-417074.jpg')} alt="Nature" />
            <h3>Nature</h3>
          </div>
          <div className="category-item">
            <img src={require('../assets/bf7644e548a12ca8d92d1f56b96b20eb-Colosseum 1.jpg')} alt="Historical" />
            <h3>Historical</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attractions;
