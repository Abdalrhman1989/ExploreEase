import React from 'react';
import Banner from '../components/Banner';
import TrendingSection from '../components/TrendingSection';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import '../styles/Stays.css'; 

import hotelImage from '../assets/hotel.jpg';
import hotel1 from '../assets/hotel1.jpg';
import hotel2 from '../assets/hotel2.jpg';
import hotel3 from '../assets/hotel3.jpg';

const Stays = () => {
  const trendingHotels = [
    { name: "Hotel California", imageUrl: hotel1 },
    { name: "Hotel Paradise", imageUrl: hotel2 },
    { name: "Hotel Royal", imageUrl: hotel3 },
  ];

  return (
    <div className="stays">
      <Banner 
        title="Find Your Perfect Stay" 
        subtitle="Browse thousands of hotels, hostels, and more" 
        buttonText="Explore Stays"
        imageUrl={hotelImage}
      />
      <SearchBar placeholder="Where are you going?" />
      <div className="content-wrapper">
        <TrendingSection title="Trending Hotels" items={trendingHotels} />
      </div>
      <Footer />
    </div>
  );
};

export default Stays;
