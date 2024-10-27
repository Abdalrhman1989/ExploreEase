'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Hotel extends Model {
    /**
     * Define associations here.
     */
    static associate(models) {
      // No associations since we're using a single table
    }
  }

  Hotel.init(
    {
      HotelID: {
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
      basePrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      roomTypes: {
        type: DataTypes.JSON, // Stores an array of room types
        allowNull: true,
      },
      seasonalPricing: {
        type: DataTypes.JSON, // Stores an array of seasonal pricing
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
      modelName: 'Hotel',
      tableName: 'Hotels',
      timestamps: true,
    }
  );

  return Hotel;
};
