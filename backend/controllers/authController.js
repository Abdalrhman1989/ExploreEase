// backend/controllers/authController.js
const { User } = require('../models');

const syncUser = async (req, res) => {
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
    });

    res.status(201).json({ message: 'User synchronized with MySQL', user: newUser });
  } catch (error) {
    console.error('Error synchronizing user with MySQL:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  syncUser,
};
