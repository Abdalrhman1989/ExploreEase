

const Amadeus = require('amadeus');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

const testFlightSearch = async () => {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: 'JFK',
      destinationLocationCode: 'LAX',
      departureDate: '2024-12-25',
      adults: 1,
    });
    console.log('Flight Offers:', response.data);
  } catch (error) {
    console.error('Error fetching flight offers:', error);
  }
};

testFlightSearch();
