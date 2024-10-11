'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Favorite extends Model {
    static associate(models) {
      Favorite.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  Favorite.init({
    userId: {
      type: DataTypes.INTEGER, // Ensure this matches UserID in User model
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['attraction', 'flight', 'hotel', 'restaurant', 'train_station', 'subway_station', 'bus_station', 'transit_station']]
      }
    },
    placeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: DataTypes.STRING,
    rating: DataTypes.FLOAT,
    priceLevel: DataTypes.INTEGER,
    photoReference: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Favorite',
  });
  return Favorite;
};
