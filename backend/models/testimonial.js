// backend/models/testimonial.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Testimonial extends Model {
    /**
     * Define associations here.
     */
    static associate(models) {
      // A Testimonial belongs to a User
      Testimonial.belongsTo(models.User, { foreignKey: 'UserID', as: 'user' });
    }
  }

  Testimonial.init({
    UserID: { // Changed from userId to UserID to match User model's primary key
      type: DataTypes.INTEGER, // Align with User.UserID type
      allowNull: false,
      references: {
        model: 'Users', // Ensure this matches the table name in your database
        key: 'UserID',
      },
      onDelete: 'CASCADE',
      validate: {
        isInt: true,
        min: 1,
      },
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Testimonial',
    tableName: 'testimonials',
    timestamps: true, // Adds createdAt and updatedAt
  });

  return Testimonial;
};
