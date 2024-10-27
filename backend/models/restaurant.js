'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Define associations here.
     */
    static associate(models) {
      // Define associations if necessary (e.g., User hasMany Restaurants)
    }
  }

  Restaurant.init(
    {
      RestaurantID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      FirebaseUID: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      cuisine: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      priceRange: {
        type: DataTypes.INTEGER, // Represented as number of '$' signs
        allowNull: false,
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      amenities: {
        type: DataTypes.JSON, // Stores an array of amenities
        allowNull: true,
      },
      images: {
        type: DataTypes.TEXT, // Stores an array of Base64 image strings
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('images');
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
          this.setDataValue('images', JSON.stringify(value));
        },
      },
      availability: {
        type: DataTypes.JSON, // Example: { "2024-10-01": true, "2024-10-02": false, ... }
        allowNull: true,
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      modelName: 'Restaurant',
      tableName: 'Restaurants',
      timestamps: true,
    }
  );

  return Restaurant;
};
