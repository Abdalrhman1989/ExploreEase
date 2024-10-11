// backend/controllers/flightController.js

const axios = require('axios');

// Function to get Amadeus Access Token
const getAmadeusAccessToken = async () => {
  const { AMADEUS_API_KEY, AMADEUS_API_SECRET } = process.env;

  const tokenURL = 'https://test.api.amadeus.com/v1/security/oauth2/token';

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', AMADEUS_API_KEY);
  params.append('client_secret', AMADEUS_API_SECRET);

  try {
    const response = await axios.post(tokenURL, params);
    return response.data.access_token;
  } catch (error) {
    console.error('Error obtaining Amadeus access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Amadeus API.');
  }
};

// Controller function to search flights
const searchFlights = async (req, res) => {
  const {
    originLocationCode,
    destinationLocationCode,
    departureDate,
    returnDate,
    adults,
    youths,
    children,
    infants,
    travelClass,
    carryOnBags,
    checkedBags,
    max,
    currencyCode,
  } = req.body;

  // Basic server-side validation
  if (!originLocationCode || originLocationCode.length !== 3) {
    return res.status(400).json({ errors: [{ msg: 'Invalid originLocationCode.' }] });
  }

  if (!destinationLocationCode || destinationLocationCode.length !== 3) {
    return res.status(400).json({ errors: [{ msg: 'Invalid destinationLocationCode.' }] });
  }

  if (!departureDate) {
    return res.status(400).json({ errors: [{ msg: 'departureDate is required.' }] });
  }

  if (!adults || adults < 1) {
    return res.status(400).json({ errors: [{ msg: 'At least one adult is required.' }] });
  }

  try {
    // Get Amadeus access token
    const accessToken = await getAmadeusAccessToken();

    // Prepare flight search payload for Amadeus API
    const flightSearchPayload = {
      currencyCode: currencyCode || 'USD',
      originDestinations: [
        {
          id: '1',
          originLocationCode: originLocationCode.toUpperCase(),
          destinationLocationCode: destinationLocationCode.toUpperCase(),
          departureDateTimeRange: {
            date: departureDate, // Expecting 'YYYY-MM-DD' format
            // Optionally, you can include time
            // time: "10:00:00"
          },
        },
      ],
      travelers: [
        {
          id: '1',
          travelerType: 'ADULT',
        },
      ],
      sources: ['GDS'],
      searchCriteria: {
        maxFlightOffers: max || 50,
        flightFilters: {
          cabinRestrictions: [
            {
              cabin: travelClass || 'ECONOMY',
              coverage: 'MOST_SEGMENTS',
              originDestinationIds: ['1'],
            },
          ],
        },
      },
    };

    // If returnDate is provided, add a second originDestination for round trip
    if (returnDate) {
      flightSearchPayload.originDestinations.push({
        id: '2',
        originLocationCode: destinationLocationCode.toUpperCase(),
        destinationLocationCode: originLocationCode.toUpperCase(),
        departureDateTimeRange: {
          date: returnDate, // 'YYYY-MM-DD'
        },
      });

      // Update travelers if needed (e.g., youths, children, infants)
      const travelerTypes = [];
      for (let i = 0; i < youths; i++) {
        travelerTypes.push({ id: `${i + 2}`, travelerType: 'YOUTH' });
      }
      for (let i = 0; i < children; i++) {
        travelerTypes.push({ id: `${i + 2 + youths}`, travelerType: 'CHILD' });
      }
      for (let i = 0; i < infants; i++) {
        travelerTypes.push({ id: `${i + 2 + youths + children}`, travelerType: 'INFANT' });
      }
      flightSearchPayload.travelers = [
        { id: '1', travelerType: 'ADULT' },
        ...travelerTypes,
      ];
    }

    // Make request to Amadeus Flight Offers Search API
    const amadeusURL = 'https://test.api.amadeus.com/v2/shopping/flight-offers';

    const response = await axios.post(amadeusURL, flightSearchPayload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.amadeus+json',
      },
    });

    // Return the flight data to the frontend
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error searching flights:', error.response?.data || error.message);

    // Handle Amadeus API errors
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status).json(data);
    }

    // Handle other errors
    return res.status(500).json({ errors: [{ msg: 'Internal Server Error.' }] });
  }
};

module.exports = {
  searchFlights,
};
