// middleware/authenticate.js
const admin = require('firebase-admin');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('authHeader:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted token:', token);

  try {
    // Verify the token with Firebase Admin SDK
    console.log('Verifying token:', token);
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Decoded token:', decodedToken);

    const firebaseUID = decodedToken.uid;
    console.log('Authenticated user UID:', firebaseUID);

    // Fetch the user from the database using FirebaseUID
    const user = await User.findOne({ where: { FirebaseUID: firebaseUID } });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found in database' });
    }

    // Attach the user to the request object
    req.user = {
      id: user.UserID,       // Database UserID
      uid: firebaseUID,      // Firebase UID
      email: user.Email,     // User's email
      // You can add other user properties as needed
    };

    next();
  } catch (error) {
    console.error('Error verifying token or fetching user:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
