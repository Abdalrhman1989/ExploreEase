'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Payments', 'stripePaymentIntentId', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Payments', 'stripePaymentIntentId', {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    });
  }
};
