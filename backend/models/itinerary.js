'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Itinerary extends Model {
    static associate(models) {
      // An Itinerary belongs to a User
      Itinerary.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Itinerary.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      destinations: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          isArray(value) {
            if (!Array.isArray(value)) {
              throw new Error('Destinations must be an array of strings.');
            }
          },
        },
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
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
    },
    {
      sequelize,
      modelName: 'Itinerary',
      tableName: 'Itineraries',
      timestamps: true,
    }
  );

  return Itinerary;
};
