'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attraction extends Model {
    /**
     * Define associations here.
     */
    static associate(models) {
      Attraction.belongsTo(models.User, { foreignKey: 'FirebaseUID', targetKey: 'FirebaseUID', as: 'user' });
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
      city: { 
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      entryFee: {
        type: DataTypes.FLOAT, 
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
      latitude: { 
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      longitude: { 
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
