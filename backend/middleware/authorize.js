const authenticate = require('./authenticate'); 
const { User } = require('../models'); 

/**
 * Authorization middleware to check if the user has one of the allowed roles.
 * @param {Array} roles 
 * @returns {Array} 
 */
const authorize = (roles) => { 
  return [
    authenticate, 
    async (req, res, next) => {
      try {
        const user = await User.findOne({ where: { FirebaseUID: req.user.uid } });

        if (!user) {
          console.warn(`User not found with FirebaseUID: ${req.user.uid}`);
          return res.status(404).json({ message: 'User not found' });
        }
        if (!roles.includes(user.UserType)) {
          console.warn(`User ${user.FirebaseUID} with role ${user.UserType} is forbidden from accessing this resource.`);
          return res.status(403).json({ message: 'Forbidden: Insufficient rights' });
        }
        req.userData = user;

        next();
      } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  ];
};

module.exports = authorize;
