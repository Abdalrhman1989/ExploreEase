// backend/migrations/XXXXXX-alter-images-field-in-hotels.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Hotels', 'images', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Hotels', 'images', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  }
};
