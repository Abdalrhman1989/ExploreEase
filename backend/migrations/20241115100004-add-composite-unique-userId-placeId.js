'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add a composite unique index on userId and placeId
    await queryInterface.addIndex('Favorites', ['userId', 'placeId'], {
      unique: true,
      name: 'unique_user_place',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the composite unique index if rolling back
    await queryInterface.removeIndex('Favorites', 'unique_user_place');
  },
};
