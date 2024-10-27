// migrations/XXXXXXXXXXXXXX-add-latitude-longitude-to-attractions.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Attractions', 'latitude', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0, // Set a default or handle existing data appropriately
    });
    await queryInterface.addColumn('Attractions', 'longitude', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Attractions', 'latitude');
    await queryInterface.removeColumn('Attractions', 'longitude');
  },
};
