'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Payment.belongsTo(models.Booking, { foreignKey: 'BookingID', as: 'booking' });
      Payment.belongsTo(models.FlightBooking, { foreignKey: 'FlightBookingID', as: 'flightBooking' });
      
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      stripePaymentIntentId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      receiptUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'UserID',
        },
        onDelete: 'CASCADE',
      },
      BookingID: { 
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
          model: 'Bookings',
          key: 'BookingID',
        },
        onDelete: 'CASCADE',
      },
      FlightBookingID: { 
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
          model: 'FlightBookings',
          key: 'FlightBookingID',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'Payment',
      tableName: 'Payments',
      timestamps: true,
    }
  );

  return Payment;
};
