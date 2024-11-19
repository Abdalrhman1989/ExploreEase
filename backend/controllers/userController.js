const { User } = require('../models');

// Get user dashboard details
const getUserDashboard = async (req, res) => {
  const firebaseUID = req.user.uid;
  try {
    const user = await User.findOne({ where: { FirebaseUID: firebaseUID } });
    if (!user) {
      return res.status(404).json({ message: 'User not found in MySQL' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const firebaseUID = req.user.uid;
  const { FirstName, LastName, Email, PhoneNumber, ProfilePicture } = req.body;
  try {
    const user = await User.findOne({ where: { FirebaseUID: firebaseUID } });
    if (!user) {
      return res.status(404).json({ message: 'User not found in MySQL' });
    }
    await user.update({ FirstName, LastName, Email, PhoneNumber, ProfilePicture });
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user profile
const deleteUserProfile = async (req, res) => {
  const firebaseUID = req.user.uid;
  try {
    const user = await User.findOne({ where: { FirebaseUID: firebaseUID } });
    if (!user) {
      return res.status(404).json({ message: 'User not found in MySQL' });
    }
    await user.destroy();
    res.status(200).json({ message: 'User profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getUserDashboard,
  updateUserProfile,
  deleteUserProfile,
};