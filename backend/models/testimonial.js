'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Testimonial extends Model {
    /**
     * Define associations here.
     */
    static associate(models) {
      Testimonial.belongsTo(models.User, { foreignKey: 'UserID', as: 'user' });
    }
  }

  Testimonial.init({
    UserID: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'Users', 
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
    timestamps: true, 
  });

  return Testimonial;
};
