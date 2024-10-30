// backend/controllers/travelStatsController.js

const { User, Trip } = require('../models');

const getUserWithTrips = async (firebaseUID) => {
  return await User.findOne({
    where: { FirebaseUID: firebaseUID },
    include: [{ model: Trip, as: 'trips' }],
  });
};

const computeTotalTrips = (trips) => trips.length;

const computeTotalDistance = (trips) =>
  trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);

const computeCountriesVisited = (trips) =>
  [...new Set(trips.map((trip) => trip.destinationCountry))];

const computeMostVisitedDestinations = (trips, topN = 5) => {
  const destinationCounts = trips.reduce((counts, trip) => {
    const destination = trip.destinationCity;
    counts[destination] = (counts[destination] || 0) + 1;
    return counts;
  }, {});

  return Object.entries(destinationCounts)
    .map(([destination, count]) => ({ destination, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
};

const computeTravelTrends = (trips) => {
  const months = trips.reduce((acc, trip) => {
    const date = new Date(trip.departureTime);
    const month = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: YYYY-M
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const sortedMonths = Object.keys(months).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const labels = sortedMonths.map((month) =>
    new Date(month).toLocaleString('default', { month: 'short', year: 'numeric' })
  );

  return {
    labels,
    data: sortedMonths.map((month) => months[month]),
  };
};

const computeAverageTripDuration = (trips) =>
  trips.length > 0
    ? trips.reduce((sum, trip) => sum + trip.duration, 0) / trips.length
    : 0;

const getTravelStats = async (req, res) => {
  try {
    const firebaseUID = req.user.uid;

    const user = await getUserWithTrips(firebaseUID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const trips = user.trips || [];

    const totalTrips = computeTotalTrips(trips);
    const totalDistance = computeTotalDistance(trips);
    const countriesVisited = computeCountriesVisited(trips);
    const mostVisitedDestinations = computeMostVisitedDestinations(trips);
    const travelTrends = computeTravelTrends(trips);
    const averageTripDuration = computeAverageTripDuration(trips);

    const stats = {
      totalTrips,
      totalDistance,
      countriesVisited,
      mostVisitedDestinations,
      travelTrends,
      averageTripDuration,
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching travel statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getTravelStats };
