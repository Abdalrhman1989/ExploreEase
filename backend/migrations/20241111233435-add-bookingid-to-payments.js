'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Payments', 'BookingID', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Bookings',
        key: 'BookingID',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // Adjust based on your requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Payments', 'BookingID');
  },
};
