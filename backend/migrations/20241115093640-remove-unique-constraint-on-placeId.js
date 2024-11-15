'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the unique index on placeId
    await queryInterface.removeIndex('Favorites', 'placeId');
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add the unique index on placeId if rolling back
    await queryInterface.addIndex('Favorites', ['placeId'], {
      unique: true,
      name: 'placeId',
    });
  },
};
