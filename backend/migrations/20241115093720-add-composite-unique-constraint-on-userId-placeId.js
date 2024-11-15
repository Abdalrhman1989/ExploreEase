'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('Favorites', ['userId', 'placeId'], {
      unique: true,
      name: 'unique_user_place',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Favorites', 'unique_user_place');
  },
};
