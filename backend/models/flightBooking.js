'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FlightBooking extends Model {
    static associate(models) {
      // A FlightBooking belongs to a User
      FlightBooking.belongsTo(models.User, { foreignKey: 'UserID', as: 'user' });
      
      // A FlightBooking has one Payment
      FlightBooking.hasOne(models.Payment, { foreignKey: 'FlightBookingID', as: 'payment' });
    }
  }

  FlightBooking.init(
    {
      FlightBookingID: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      UserID: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'UserID',
        },
        onDelete: 'CASCADE',
      },
      // Flight details
      flightNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      departureAirport: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      arrivalAirport: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      departureTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      arrivalTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      seatClass: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      // Traveler details
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      passportNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      issuanceDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      expiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      issuanceCountry: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },
      nationality: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending',
      },
    },
    {
      sequelize,
      modelName: 'FlightBooking',
      tableName: 'FlightBookings',
      timestamps: true,
    }
  );

  return FlightBooking;
};
