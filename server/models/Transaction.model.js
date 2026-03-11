const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit_purchase', 'subscription', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  tokens: {
    type: Number,
    default: 0
  },
  stripePaymentIntentId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);