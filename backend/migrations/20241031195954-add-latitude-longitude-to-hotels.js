'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Hotels', 'latitude', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0, // Temporary default, consider updating existing records accordingly
    });

    await queryInterface.addColumn('Hotels', 'longitude', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0, // Temporary default, consider updating existing records accordingly
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Hotels', 'latitude');
    await queryInterface.removeColumn('Hotels', 'longitude');
  },
};
