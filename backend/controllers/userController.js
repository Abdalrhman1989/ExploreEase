// backend/controllers/userController.js
const { User } = require('../models');

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

module.exports = {
  getUserDashboard,
};
