const User = require('../models/User.model');
const Project = require('../models/Project.model');
const Transaction = require('../models/Transaction.model');

// @route GET /api/v1/admin/users
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/v1/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { plan, tokens, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (plan) user.plan = plan;
    if (tokens !== undefined) user.tokens = tokens;
    if (role) user.role = role;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/v1/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/v1/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalDone = await Project.countDocuments({ status: 'done' });

    const planCounts = await User.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);

    const templateCounts = await Project.aggregate([
      { $group: { _id: '$template', count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      totalProjects,
      totalDone,
      planCounts,
      templateCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, updateUser, deleteUser, getAnalytics };