// backend/migrations/20241001020605-create-user.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      UserID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      FirebaseUID: { // New field
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(255),
      },
      UserName: {
        allowNull: false,
        type: Sequelize.STRING(50),
      },
      FirstName: {
        allowNull: false,
        type: Sequelize.STRING(50),
      },
      LastName: {
        allowNull: false,
        type: Sequelize.STRING(50),
      },
      Email: {
        allowNull: false,
        type: Sequelize.STRING(100),
        unique: true,
      },
      Password: { // Optional
        allowNull: true,
        type: Sequelize.STRING(255),
      },
      PhoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      UserType: {
        allowNull: false,
        type: Sequelize.ENUM('User', 'Admin', 'BusinessAdministrator'),
      },
      ProfilePicture: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      AccountCreatedDate: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  },
};
