// migrations/YYYYMMDDHHMMSS-create-trip.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Trips', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: { // Foreign key to Users table
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', 
          key: 'UserID'   
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: { // ENUM: bus, train, flight
        type: Sequelize.ENUM('bus', 'train', 'flight'),
        allowNull: false
      },
      origin: {
        type: Sequelize.STRING,
        allowNull: false
      },
      destination: {
        type: Sequelize.STRING,
        allowNull: false
      },
      departureTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      arrivalTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      duration: { // Duration in minutes
        type: Sequelize.INTEGER,
        allowNull: false
      },
      transitStops: { // JSON array of stops
        type: Sequelize.JSON,
        allowNull: true
      },
      transitLines: { // JSON array of transit lines
        type: Sequelize.JSON,
        allowNull: true
      },
      schedule: { // JSON array of schedule segments
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: { // Timestamps
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: { // Timestamps
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Optional: Add indexes for performance
    await queryInterface.addIndex('Trips', ['userId']);
    await queryInterface.addIndex('Trips', ['departureTime']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Trips');
    // Drop ENUM type if using PostgreSQL
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Trips_type";');
    }
  }
};
