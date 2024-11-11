import React, { useState } from 'react';
import '../styles/SearchBar.css';

const SearchBar = ({ placeholder }) => {
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSearch = () => {
    console.log(`Searching for stays in ${location} from ${checkInDate} to ${checkOutDate} for ${guests} guests.`);
    // Implement search functionality for stays
  };

  return (
    <div className="search-bar-advanced">
      <input 
        type="text" 
        placeholder={placeholder} 
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input 
        type="date" 
        value={checkInDate}
        onChange={(e) => setCheckInDate(e.target.value)}
        placeholder="Check-in date"
      />
      <input 
        type="date" 
        value={checkOutDate}
        onChange={(e) => setCheckOutDate(e.target.value)}
        placeholder="Check-out date"
      />
      <input 
        type="number" 
        min="1"
        value={guests}
        onChange={(e) => setGuests(e.target.value)}
        placeholder="Guests"
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
