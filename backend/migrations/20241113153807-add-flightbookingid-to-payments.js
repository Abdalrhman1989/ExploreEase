'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add FlightBookingID column to Payments table
    await queryInterface.addColumn('Payments', 'FlightBookingID', {
      type: Sequelize.INTEGER,
      allowNull: true, // Allows Payment to be associated with FlightBooking
      references: {
        model: 'FlightBookings', // Name of the target model/table
        key: 'FlightBookingID',   // Key in the target model
      },
      onDelete: 'CASCADE', // Delete payment if associated FlightBooking is deleted
      onUpdate: 'CASCADE',
    });

    // 2. Modify BookingID column to allow NULLs
    await queryInterface.changeColumn('Payments', 'BookingID', {
      type: Sequelize.INTEGER,
      allowNull: true, // Allows Payment to be associated with FlightBooking instead
      references: {
        model: 'Bookings', // Name of the target model/table
        key: 'BookingID',   // Key in the target model
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // 3. (Optional) Add a unique constraint to prevent multiple payments for the same booking
    // await queryInterface.addConstraint('Payments', {
    //   fields: ['BookingID', 'FlightBookingID'],
    //   type: 'unique',
    //   name: 'unique_payment_per_booking',
    // });
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Remove FlightBookingID column from Payments table
    await queryInterface.removeColumn('Payments', 'FlightBookingID');

    // 2. Revert BookingID column to NOT NULL
    await queryInterface.changeColumn('Payments', 'BookingID', {
      type: Sequelize.INTEGER,
      allowNull: false, // Revert to original state
      references: {
        model: 'Bookings',
        key: 'BookingID',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // 3. (Optional) Remove the unique constraint if it was added
    // await queryInterface.removeConstraint('Payments', 'unique_payment_per_booking');
  }
};
