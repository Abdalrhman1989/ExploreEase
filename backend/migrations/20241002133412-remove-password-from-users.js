'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'Password');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'Password', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  }
};
