'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Drop the Recommendations table with cascade to handle foreign keys
      await queryInterface.dropTable('Recommendations', { cascade: true });
      console.log('Recommendations table dropped successfully.');
    } catch (error) {
      console.error('Failed to drop Recommendations table:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Recreate the Recommendations table if the migration is rolled back
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
