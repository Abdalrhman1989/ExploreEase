// src/pages/Destination.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Firestore instance
import '../styles/Destination.css';
import MapComponent from '../components/MapComponent'; // Import the new MapComponent

const Destination = () => {
  const { destinationName } = useParams(); // Get destination name from URL
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null); // Store user location
  const [travelMode, setTravelMode] = useState('DRIVING'); // Default travel mode is driving

  // Fetch city data from Firestore based on destinationName (slug)
  useEffect(() => {
    const fetchCityData = async () => {
      if (!destinationName) {
        console.error('Destination parameter is undefined');
        setLoading(false);
        return;
      }

      try {
        const normalizedDestinationName = destinationName
          .toLowerCase()
          .replace(/\s+/g, '-');
        console.log(`Fetching data for: ${normalizedDestinationName}`);

        const q = query(
          collection(db, 'cities'),
          where('slug', '==', normalizedDestinationName)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (
              !data.coordinates ||
              typeof data.coordinates.latitude !== 'number' ||
              typeof data.coordinates.longitude !== 'number'
            ) {
              console.error('Invalid coordinates in city data:', data);
              return;
            }
            setCityData(data);
          });
        } else {
          console.error('No city data found');
        }
      } catch (error) {
        console.error('Error fetching city data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCityData();
  }, [destinationName]);

  // Fetch user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.error('Error fetching user location');
        }
      );
    } else {
      console.error('Geolocation not supported by this browser.');
    }
  }, []);

  // Handle gallery image click (modal is now in MapComponent)
  // You can remove modal-related state and handlers from here if not used elsewhere

  // Render loading or error states
  if (loading)
    return <div className="loading">Loading destination data...</div>;

  if (!cityData) {
    return <div className="no-data">No data available for this destination.</div>;
  }

  return (
    <div className="destination-page">
      {/* Header Section */}
      <header
        className="destination-header"
        style={{ backgroundImage: `url(${cityData.bannerImage})` }}
      >
        <div className="overlay"></div>
        <div className="header-content">
          <h1>
            {cityData.title ||
              `Explore ${destinationName.charAt(0).toUpperCase() +
                destinationName.slice(1)}`}
          </h1>
          <Link to="/flights">
            <button className="cta-button">
              Book a Trip to{' '}
              {cityData.title || destinationName}
            </button>
          </Link>
        </div>
      </header>

      {/* Overview Section */}
      <section className="destination-overview">
        <h2>
          About{' '}
          {destinationName.charAt(0).toUpperCase() +
            destinationName.slice(1)}
        </h2>
        <p>{cityData.description}</p>
      </section>

      {/* Highlights Section */}
      <section className="destination-highlights">
        <h2>Top Highlights</h2>
        <div className="highlights-grid">
          {cityData.highlights?.map((highlight, index) => (
            <div key={index} className="highlight-item">
              <img src={highlight.image} alt={highlight.name} />
              <h3>{highlight.name}</h3>
              <p>{highlight.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="destination-gallery">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          {cityData.gallery?.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Gallery Image ${index + 1}`}
              className="gallery-image"
              // The modal functionality has been moved to MapComponent
              // If you still want to handle modals here, consider keeping the state and handlers
            />
          ))}
        </div>
      </section>

      {/* Map and Attractions Section */}
      <section className="destination-map">
        <MapComponent
          cityData={cityData}
          userLocation={userLocation}
          travelMode={travelMode}
          setTravelMode={setTravelMode}
        />
      </section>
    </div>
  );
};

export default Destination;
