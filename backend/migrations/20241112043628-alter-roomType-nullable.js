// migrations/[timestamp]-alter-roomType-nullable.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Bookings', 'roomType', {
      type: Sequelize.STRING(100),
      allowNull: true, // Make roomType nullable
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Bookings', 'roomType', {
      type: Sequelize.STRING(100),
      allowNull: false, // Revert back to non-nullable in case of rollback
    });
  },
};
