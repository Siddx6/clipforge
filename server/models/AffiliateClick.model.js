const mongoose = require('mongoose');

const affiliateClickSchema = new mongoose.Schema({
  affiliateCode: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  convertedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('AffiliateClick', affiliateClickSchema);