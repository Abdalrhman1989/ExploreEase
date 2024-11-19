const { sequelize, User, Itinerary } = require('../models');

async function testItineraryCreation() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const user = await User.findOne({ where: { UserID: 1 } }); 

    if (!user) {
      console.log('No user found with UserID 1.');
      return;
    }

    // Create a new Itinerary
    const itinerary = await Itinerary.create({
      name: 'Test Itinerary',
      destinations: ['City A', 'City B'],
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-10'),
      notes: 'Test notes',
      userId: user.UserID,
    });

    console.log('Itinerary created:', itinerary.toJSON());
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

testItineraryCreation();
