// backend/migrations/20241111191938-create-bookings.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Bookings', {
      BookingID: { // It's good practice to name the primary key uniquely
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      UserID: { // Matching the primary key in Users
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Ensure this matches your Users table name
          key: 'UserID', // Corrected from 'id' to 'UserID'
        },
        onDelete: 'CASCADE',
      },
      HotelID: { // Matching the primary key in Hotels
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Hotels', // Ensure this matches your Hotels table name
          key: 'HotelID', // Corrected from 'id' to 'HotelID'
        },
        onDelete: 'CASCADE',
      },
      fullName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      checkIn: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      checkOut: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      guests: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      roomType: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Bookings');
  },
};
