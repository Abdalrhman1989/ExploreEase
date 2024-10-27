// backend/models/favorite.js

module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    id: { // Use 'id' as the primary key
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    createdAt: { // Ensure timestamps are correctly defined
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'Favorites',
    timestamps: true, // Ensure Sequelize manages timestamps
  });

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Favorite;
};
