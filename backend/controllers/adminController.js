// backend/controllers/adminController.js

const { User } = require('../models'); // Import the User model via models/index.js
const admin = require('../firebaseAdmin'); // Import Firebase Admin SDK
const bcrypt = require('bcrypt'); // Import bcrypt for hashing passwords
const { Op } = require('sequelize'); // Import Op from Sequelize

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'UserID',
        'UserName',
        'FirstName',
        'LastName',
        'Email',
        'PhoneNumber',
        'UserType',
        'ProfilePicture',
        'AccountCreatedDate',
        'createdAt',
        'updatedAt'
      ]
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a user
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { FirstName, LastName, Email, PhoneNumber, UserType, ProfilePicture } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      console.warn(`User not found with UserID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      FirstName,
      LastName,
      Email,
      PhoneNumber,
      UserType,
      ProfilePicture
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      console.warn(`User not found with UserID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new user
const createUser = async (req, res) => {
  const { UserName, Password, FirstName, LastName, Email, PhoneNumber, UserType, ProfilePicture } = req.body;

  // Validate required fields
  if (!UserName || !Password || !FirstName || !LastName || !Email || !UserType) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 1. Check if UserName or Email already exists in MySQL
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ UserName }, { Email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'UserName or Email already in use' });
    }

    // 2. Prepare user creation data for Firebase
    const userCreationData = {
      email: Email,
      password: Password,
      displayName: `${FirstName} ${LastName}`,
      // Do not include photoURL if ProfilePicture is not provided
      ...(ProfilePicture && ProfilePicture.trim() !== '' ? { photoURL: ProfilePicture } : {})
    };

    // 3. Create user in Firebase Authentication
    const firebaseUser = await admin.auth().createUser(userCreationData);

    // 4. Hash the password before storing in MySQL (if storing passwords in MySQL)
    // Note: If you're relying solely on Firebase for authentication, you might not need to store the password in MySQL.
    const hashedPassword = await bcrypt.hash(Password, 10);

    // 5. Create user in MySQL
    const newUser = await User.create({
      FirebaseUID: firebaseUser.uid,
      UserName,
      FirstName,
      LastName,
      Email,
      PhoneNumber: PhoneNumber || null,
      UserType,
      ProfilePicture: ProfilePicture || null,
      // Include hashedPassword if necessary
      // Password: hashedPassword,
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);

    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ message: 'Email already in use' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};
const getUsersCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching users count:', error);
    res.status(500).json({ message: 'Failed to fetch users count.' });
  }
}

// Export the controller functions, including createUser
module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  createUser, // Ensure createUser is exported
  getUsersCount,      // Export the new functions

};
