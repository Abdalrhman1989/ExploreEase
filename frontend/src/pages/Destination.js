import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import '../styles/Destination.css';
import { Link } from 'react-router-dom';
import sampleImage from '../assets/download.jpeg'; // Use the image you uploaded

const Destination = () => {
  return (
    <div className="destination-page">
      {/* Header Section */}
      <header className="destination-header" style={{ backgroundImage: `url(${sampleImage})` }}>
        <div className="overlay"></div>
        <div className="header-content">
          <h1>Explore Paris</h1>
          <p>Discover the City of Lights</p>
        </div>
      </header>

      {/* Overview Section */}
      <section className="destination-overview">
        <h2>About Paris</h2>
        <p>
          Paris, the capital city of France, is known for its art, fashion, and culture. The city is
          home to iconic landmarks such as the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral.
          Whether you're strolling along the Seine River, enjoying a café in Montmartre, or exploring the
          historic streets of Le Marais, Paris offers a unique experience for every visitor.
        </p>
      </section>

      {/* Highlights Section */}
      <section className="destination-highlights">
        <h2>Top Highlights</h2>
        <div className="highlights-grid">
          <div className="highlight-item">
            <img src={sampleImage} alt="Eiffel Tower" />
            <h3>Eiffel Tower</h3>
            <p>The symbol of Paris and a must-visit landmark.</p>
          </div>
          <div className="highlight-item">
            <img src={sampleImage} alt="Louvre Museum" />
            <h3>Louvre Museum</h3>
            <p>Home to thousands of works of art, including the Mona Lisa.</p>
          </div>
          <div className="highlight-item">
            <img src={sampleImage} alt="Seine River" />
            <h3>Seine River</h3>
            <p>Enjoy a scenic cruise along the Seine River.</p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="destination-gallery">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          <img src={sampleImage} alt="Gallery 1" />
          <img src={sampleImage} alt="Gallery 2" />
          <img src={sampleImage} alt="Gallery 3" />
          <img src={sampleImage} alt="Gallery 4" />
        </div>
      </section>

      {/* Nearby Attractions Section */}
      <section className="nearby-attractions">
        <h2>Nearby Attractions</h2>
        <ul>
          <li><Link to="/destination/versailles">Palace of Versailles</Link></li>
          <li><Link to="/destination/disneyland">Disneyland Paris</Link></li>
          <li><Link to="/destination/normandy">Normandy Beaches</Link></li>
        </ul>
      </section>

      {/* Map Section */}
      <section className="destination-map">
        <h2>Location</h2>
        <div className="map-container">
          <MapContainer center={[48.8566, 2.3522]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[48.8566, 2.3522]}>
              <Popup>
                Paris, France
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="call-to-action">
        <h2>Ready to Explore Paris?</h2>
        <Link to="/book-now">
          <button className="cta-button">Book Your Trip</button>
        </Link>
      </section>
    </div>
  );
};

export default Destination;
