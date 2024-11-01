'use strict';
module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    id: { 
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', 
        key: 'UserID',  
      },
      onDelete: 'CASCADE', 
      onUpdate: 'CASCADE', 
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    placeId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
    },
    rating: {
      type: DataTypes.FLOAT,
    },
    priceLevel: {
      type: DataTypes.INTEGER,
    },
    photoReference: {
      type: DataTypes.STRING,
    },
    createdAt: { 
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'Favorites',
    timestamps: true, 
  });

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, { foreignKey: 'userId',targetKey: 'UserID',
      as: 'user' });
  };

  return Favorite;
};
