'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attraction extends Model {
    /**
     * Define associations here.
     */
    static associate(models) {
      // Example: Attraction belongs to User
      // Attraction.belongsTo(models.User, { foreignKey: 'FirebaseUID', targetKey: 'FirebaseUID' });
    }
  }

  Attraction.init(
    {
      AttractionID: {
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
        // You can remove this field if you prefer separate latitude and longitude
      },
      city: { // Added city field
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      entryFee: {
        type: DataTypes.FLOAT, // Using FLOAT for entry fees that may include decimals
        allowNull: false,
      },
      openingHours: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      amenities: {
        type: DataTypes.JSON, // Stores an array or object of amenities
        allowNull: true,
      },
      images: {
        type: DataTypes.TEXT, // Stores an array of image URLs or Base64 strings
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('images');
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
          this.setDataValue('images', JSON.stringify(value));
        },
      },
      latitude: { // Added latitude field
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      longitude: { // Added longitude field
        type: DataTypes.FLOAT,
        allowNull: false,
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
      modelName: 'Attraction',
      tableName: 'Attractions',
      timestamps: true,
    }
  );

  return Attraction;
};
