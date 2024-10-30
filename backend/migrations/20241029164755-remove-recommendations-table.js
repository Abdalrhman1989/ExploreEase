// migrations/20241030120000-remove-recommendations-table.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the Recommendations table
    await queryInterface.dropTable('Recommendations');
  },

  down: async (queryInterface, Sequelize) => {
    // Recreate the Recommendations table if needed
    await queryInterface.createTable('Recommendations', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'UserID',
        },
        onDelete: 'CASCADE',
      },
      // Timestamp fields
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
};
