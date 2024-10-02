// backend/routes/auth.js
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

// Registration Synchronization Endpoint
router.post('/sync', authenticate, async (req, res) => {
  const { name, firstName, lastName, email, phoneNumber, userType, profilePicture } = req.body;
  const firebaseUID = req.user.uid;

  try {
    // Check if user already exists in MySQL
    const existingUser = await User.findOne({ where: { FirebaseUID: firebaseUID } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists in MySQL' });
    }

    // Create new user in MySQL
    const newUser = await User.create({
      FirebaseUID: firebaseUID,
      UserName: name,
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      PhoneNumber: phoneNumber,
      UserType: userType,
      ProfilePicture: profilePicture,
      // Password is managed by Firebase, so it's optional here
    });

    res.status(201).json({ message: 'User synchronized with MySQL', user: newUser });
  } catch (error) {
    console.error('Error synchronizing user with MySQL:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
