// backend/models/user.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here if any
    }
  }
  User.init({
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    FirebaseUID: { // Link to Firebase UID
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
      unique: true
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
    tableName: 'Users',
    timestamps: true, // Sequelize håndterer createdAt og updatedAt
  });
  return User;
};
