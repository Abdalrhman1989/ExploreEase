'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Define associations here.
     */
    static associate(models) {
      Restaurant.belongsTo(models.User, { foreignKey: 'FirebaseUID', targetKey: 'FirebaseUID', as: 'user' });

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
      cuisine: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      priceRange: {
        type: DataTypes.INTEGER, 
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
