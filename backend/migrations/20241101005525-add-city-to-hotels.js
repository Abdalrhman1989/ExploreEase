'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Hotels', 'city', {
      type: Sequelize.STRING(100),
      allowNull: false,
      after: 'location', // Positioning the new column after 'location'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Hotels', 'city');
  }
};
