const { Sequelize } = require('sequelize');

// Load environment variables (if using dotenv)
require('dotenv').config();

// Create a Sequelize instance using your environment variables or directly with the credentials
const sequelize = new Sequelize(
  process.env.DB_NAME_DEVELOPMENT || 'servixerspace_com_db',
  process.env.DB_USERNAME || 'servixerspace_com',
  process.env.DB_PASSWORD || 'AH3cfEzax6k9h5nBmrRe',
  {
    host: process.env.DB_HOST || 'mysql71.unoeuro.com',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
  }
);

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to the MySQL database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the MySQL database:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testConnection();
