// backend/routes/protected.js
const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin');
const { User } = require('../models');

// Middleware to verify Firebase ID Token
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Example Protected Endpoint
router.get('/dashboard', authenticate, async (req, res) => {
  const firebaseUID = req.user.uid;

  try {
    const user = await User.findOne({ where: { FirebaseUID: firebaseUID } });
    if (!user) {
      return res.status(404).json({ message: 'User not found in MySQL' });
    }

    // Fetch related data as needed
    // Example: Fetch user profile
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
