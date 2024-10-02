// Map.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Map.css'; 

const Map = ({ center, zoom }) => {
  const ChangeMapView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
  };

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: "400px", width: "100%" }}>
      <ChangeMapView center={center} zoom={zoom} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[48.8566, 2.3522]}>
        <Popup>
          Eiffel Tower, Paris, France
        </Popup>
      </Marker>
      <Marker position={[40.4319, 116.5704]}>
        <Popup>
          Great Wall of China
        </Popup>
      </Marker>
      <Marker position={[36.1070, -112.1130]}>
        <Popup>
          Grand Canyon, USA
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
