const User = require('../models/User.model');

// @route GET /api/v1/users/stats
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({
      tokensUsed: 30 - user.tokens,
      tokensRemaining: user.tokens,
      plan: user.plan,
      memberSince: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/v1/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;

    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, plan: user.plan, tokens: user.tokens });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/v1/users/password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!await user.matchPassword(currentPassword)) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.passwordHash = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/v1/users/account
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.clearCookie('refreshToken');
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserStats, updateProfile, updatePassword, deleteAccount };