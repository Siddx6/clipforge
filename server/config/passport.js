require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.model');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this email
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // User exists — just log them in
      return done(null, user);
    }

    // New user — create account
    const affiliateCode = 'AF-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    user = await User.create({
      name:          profile.displayName,
      email:         profile.emails[0].value,
      passwordHash:  'GOOGLE_OAuth_' + profile.id, // placeholder, not used for login
      affiliateCode,
    });

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport;