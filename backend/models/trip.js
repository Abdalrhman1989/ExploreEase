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
    UserID: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', 
        key: 'UserID'    
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    type: { 
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
    duration: { 
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transitStops: { 
      type: DataTypes.JSON,
      allowNull: true
    },
    transitLines: { 
      type: DataTypes.JSON,
      allowNull: true
    },
    schedule: { 
      type: DataTypes.JSON,
      allowNull: true
    },
    createdAt: { 
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: { 
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
