// models/trip.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Trip extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association to User
      Trip.belongsTo(models.User, { foreignKey: 'UserID', as: 'user' });
    }
  }
  Trip.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    UserID: { // Foreign key
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Must match the table name
        key: 'UserID'    // Must match the primary key in User model
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    type: { // ENUM: bus, train, flight
      type: DataTypes.ENUM('bus', 'train', 'flight'),
      allowNull: false
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    departureTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    arrivalTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: { // Duration in minutes
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transitStops: { // JSON array
      type: DataTypes.JSON,
      allowNull: true
    },
    transitLines: { // JSON array
      type: DataTypes.JSON,
      allowNull: true
    },
    schedule: { // JSON array
      type: DataTypes.JSON,
      allowNull: true
    },
    createdAt: { // Timestamp
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: { // Timestamp
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Trip',
    tableName: 'Trips',
    timestamps: true,
  });
  return Trip;
};
