'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Hotels', 'availability', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Availability data in YYYY-MM-DD format with boolean values',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Hotels', 'availability');
  },
};
