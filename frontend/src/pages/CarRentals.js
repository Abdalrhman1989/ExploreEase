import React from 'react';
import Banner from '../components/Banner';
import TrendingSection from '../components/TrendingSection';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import '../styles/CarRentals.css';

import carRenterImage from '../assets/carrenter.jpg';
import car1 from '../assets/carrenter1.jpg';
import car2 from '../assets/carrenter2.jpg';
import car3 from '../assets/careneter3.jpg';

const CarRentals = () => {
  const trendingCars = [
    { name: "Tesla Model 3", imageUrl: car1 },
    { name: "BMW 3 Series", imageUrl: car2 },
    { name: "Audi A4", imageUrl: car3 },
  ];

  return (
    <div className="car-rentals">
      <Banner 
        title="Find Your Car Rental" 
        subtitle="Get the best deals on rental cars" 
        buttonText="Explore Cars"
        imageUrl={carRenterImage}
      />
      <SearchBar placeholder="Pick-up location" />
      <div className="content-wrapper">
        <TrendingSection title="Trending Cars" items={trendingCars} />
      </div>

    </div>
  );
};

export default CarRentals;
