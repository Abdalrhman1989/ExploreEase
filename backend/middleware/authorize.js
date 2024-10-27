// backend/middleware/authorize.js

const authenticate = require('./authenticate'); // Middleware to authenticate using Firebase
const { User } = require('../models'); // Import User model via models/index.js

/**
 * Authorization middleware to check if the user has one of the allowed roles.
 * @param {Array} roles - An array of allowed roles (e.g., ['User', 'BusinessAdministrator'])
 * @returns {Array} - An array of middleware functions
 */
const authorize = (roles) => { // 'roles' is an array
  return [
    authenticate, // First, authenticate the user
    async (req, res, next) => {
      try {
        // Find the user in the database based on FirebaseUID
        const user = await User.findOne({ where: { FirebaseUID: req.user.uid } });

        if (!user) {
          console.warn(`User not found with FirebaseUID: ${req.user.uid}`);
          return res.status(404).json({ message: 'User not found' });
        }

        // Check if user's role is included in the allowed roles
        if (!roles.includes(user.UserType)) {
          console.warn(`User ${user.FirebaseUID} with role ${user.UserType} is forbidden from accessing this resource.`);
          return res.status(403).json({ message: 'Forbidden: Insufficient rights' });
        }

        // Attach user data to the request object for further use if needed
        req.userData = user;

        // Proceed to the next middleware or route handler
        next();
      } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  ];
};

module.exports = authorize;
