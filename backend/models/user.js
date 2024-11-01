// backend/models/user.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here
      User.hasMany(models.Favorite, { foreignKey: 'userId', as: 'favorites' });
      User.hasMany(models.Trip, { foreignKey: 'userId', as: 'trips' });
      User.hasMany(models.Testimonial, { foreignKey: 'userId', as: 'testimonials' });
      User.hasMany(models.Attraction, { foreignKey: 'FirebaseUID', as: 'attractions' });
      User.hasMany(models.Itinerary, { foreignKey: 'userId', as: 'itineraries' });
      User.hasMany(models.Hotel, { foreignKey: 'FirebaseUID', sourceKey: 'FirebaseUID', as: 'hotels' });
      User.hasMany(models.Restaurant, { foreignKey: 'FirebaseUID', sourceKey: 'FirebaseUID', as: 'restaurants' });
      User.hasMany(models.Payment, { foreignKey: 'userId', as: 'payments' });
    }
  }

  User.init({
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    FirebaseUID: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    UserName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    FirstName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    LastName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    PhoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[0-9\-+()\s]*$/i
      }
    },
    UserType: {
      type: DataTypes.ENUM('User', 'Admin', 'BusinessAdministrator'),
      allowNull: false,
      defaultValue: 'User'
    },
    ProfilePicture: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    AccountCreatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  });

  return User;
};
