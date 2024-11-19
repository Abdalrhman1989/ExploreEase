const { User } = require('../models'); 
const admin = require('../firebaseAdmin'); 
const bcrypt = require('bcrypt'); 
const { Op } = require('sequelize'); 

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

    // user creation data for Firebase
    const userCreationData = {
      email: Email,
      password: Password,
      displayName: `${FirstName} ${LastName}`,
      ...(ProfilePicture && ProfilePicture.trim() !== '' ? { photoURL: ProfilePicture } : {})
    };

    // Create user in Firebase Authentication
    const firebaseUser = await admin.auth().createUser(userCreationData);

    // 4. Hash the password before storing in MySQL
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
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    
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

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  createUser, 
  getUsersCount,      

};
