const User = require('../models/User.model');
const AffiliateClick = require('../models/AffiliateClick.model');

// @route GET /api/v1/affiliate/stats
const getAffiliateStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const totalClicks = await AffiliateClick.countDocuments({
      affiliateCode: user.affiliateCode
    });

    const totalConversions = await AffiliateClick.countDocuments({
      affiliateCode: user.affiliateCode,
      convertedAt: { $exists: true }
    });

    const referrals = await User.find({ referredBy: req.user._id })
      .select('name email plan createdAt')
      .sort({ createdAt: -1 });

    res.json({
      affiliateCode: user.affiliateCode,
      referralLink: `${process.env.FRONTEND_URL}/ref/${user.affiliateCode}`,
      totalClicks,
      totalConversions,
      referrals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/v1/affiliate/track
const trackClick = async (req, res) => {
  try {
    const { affiliateCode } = req.params;

    const affiliateUser = await User.findOne({ affiliateCode });
    if (!affiliateUser) {
      return res.status(404).json({ message: 'Invalid affiliate code' });
    }

    await AffiliateClick.create({
      affiliateCode,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: 'Click tracked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAffiliateStats, trackClick };