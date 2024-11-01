// backend/middleware/authenticate.js

const admin = require('../firebaseAdmin'); // Adjust the path as needed

const authenticate = async (req, res, next) => {
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

    // Attach the decoded token to the request object
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = authenticate;
