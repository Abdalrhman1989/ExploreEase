// backend/dataStore.js

const travelers = [];
const flightOrders = [];

/**
 * Generates a unique identifier.
 * @returns {string} A unique ID string.
 */
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

module.exports = {
  travelers,
  flightOrders,
  generateId,
};
