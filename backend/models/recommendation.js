'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Recommendation extends Model {
    static associate(models) {
      // A Recommendation belongs to a User
      Recommendation.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Recommendation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
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
      modelName: 'Recommendation',
      tableName: 'Recommendations',
      timestamps: true,
    }
  );

  return Recommendation;
};
