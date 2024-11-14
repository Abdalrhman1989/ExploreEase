'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Payments', 'BookingID', {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow NULL for BookingID
      references: {
        model: 'Bookings',
        key: 'BookingID',
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.changeColumn('Payments', 'FlightBookingID', {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow NULL for FlightBookingID
      references: {
        model: 'FlightBookings',
        key: 'FlightBookingID',
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Payments', 'BookingID', {
      type: Sequelize.INTEGER,
      allowNull: false, // Revert to NOT NULL if needed
      references: {
        model: 'Bookings',
        key: 'BookingID',
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.changeColumn('Payments', 'FlightBookingID', {
      type: Sequelize.INTEGER,
      allowNull: false, // Revert to NOT NULL if needed
      references: {
        model: 'FlightBookings',
        key: 'FlightBookingID',
      },
      onDelete: 'CASCADE',
    });
  },
};
