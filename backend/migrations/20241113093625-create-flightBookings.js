'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('FlightBookings', {
      FlightBookingID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      UserID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Ensure this matches your Users table name
          key: 'UserID',
        },
        onDelete: 'CASCADE',
      },
      flightNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      departureAirport: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      arrivalAirport: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      departureTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      arrivalTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      seatClass: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      dateOfBirth: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      passportNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      issuanceDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      expiryDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      issuanceCountry: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },
      nationality: {
        type: Sequelize.STRING(3),
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
    await queryInterface.dropTable('FlightBookings');
  },
};
