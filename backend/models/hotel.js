'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Hotel extends Model {

    static associate(models) {
      Hotel.belongsTo(models.User, { foreignKey: 'FirebaseUID', targetKey: 'FirebaseUID', as: 'user' });  
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
        references: {
          model: 'Users',
          key: 'FirebaseUID',
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      city: { // New field
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      latitude: { 
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      longitude: { 
        type: DataTypes.FLOAT,
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
        type: DataTypes.JSON, 
        allowNull: true,
      },
      seasonalPricing: {
        type: DataTypes.JSON, 
        allowNull: true,
      },
      amenities: {
        type: DataTypes.JSON, 
        allowNull: true,
      },
      images: {
        type: DataTypes.TEXT, 
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
        type: DataTypes.JSON, 
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
