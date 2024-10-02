// backend/middleware/authorize.js
const authorize = (roles = []) => {
    // roles param can be a single role string (e.g., 'Admin') or an array of roles (e.g., ['Admin', 'BusinessAdministrator'])
    if (typeof roles === 'string') {
      roles = [roles];
    }
  
    return [
      // Authentication middleware should have been called before
      (req, res, next) => {
        if (!req.user) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        next();
      },
      // Authorization middleware
      async (req, res, next) => {
        const { User } = require('../models');
        try {
          const user = await User.findOne({ where: { FirebaseUID: req.user.uid } });
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
          if (!roles.includes(user.UserType)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient rights' });
          }
          req.userData = user; // Attach user data to request
          next();
        } catch (error) {
          console.error('Error in authorization middleware:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
    ];
  };
  
  module.exports = authorize;
  