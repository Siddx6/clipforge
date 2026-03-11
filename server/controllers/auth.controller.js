const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// @route POST /api/v1/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const affiliateCode = 'AF-' + Math.random().toString(36).substr(2, 8).toUpperCase();

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      affiliateCode
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      tokens: user.tokens,
      role: user.role,
      accessToken
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route POST /api/v1/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      tokens: user.tokens,
      role: user.role,
      accessToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/v1/auth/refresh
const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(decoded.id);

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// @route POST /api/v1/auth/logout
const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

// @route GET /api/v1/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, refresh, logout, getMe };