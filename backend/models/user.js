'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // associations can be defined here
    }
  }
  User.init({
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
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
      allowNull: false
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    PhoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    UserType: {
      type: DataTypes.ENUM('User', 'Admin', 'BusinessAdministrator'),
      allowNull: false
    },
    ProfilePicture: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    AccountCreatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
