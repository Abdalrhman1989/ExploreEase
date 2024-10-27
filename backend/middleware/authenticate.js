// backend/middleware/authenticate.js
const admin = require('../firebaseAdmin');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('authHeader:', authHeader); // Log the auth header
  const token = authHeader && authHeader.split(' ')[1]; // Updated split
  console.log('Extracted token:', token); // Log the extracted token

  if (!token) {
    console.warn('Unauthorized: No token provided');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    console.log('Verifying token:', token);
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    console.log(`Authenticated user UID: ${decodedToken.uid}`);
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = authenticate;
