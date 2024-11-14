'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      // A Booking belongs to a User
      Booking.belongsTo(models.User, { foreignKey: 'UserID', as: 'user' });
      Booking.belongsTo(models.Hotel, { foreignKey: 'HotelID', as: 'hotel' });
      Booking.hasOne(models.Payment, { foreignKey: 'BookingID', as: 'payment' });
    }
  }

  Booking.init(
    {
      BookingID: { 
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
      HotelID: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Hotels',
          key: 'HotelID',
        },
        onDelete: 'CASCADE',
      },
      fullName: {
        type: DataTypes.STRING(255),
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
      checkIn: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      checkOut: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      guests: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      roomType: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      
    },
    {
      sequelize,
      modelName: 'Booking',
      tableName: 'Bookings',
      timestamps: true,
    }
  );

  return Booking;
};
