const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLANS = {
  free: { tokens: 30, price: 0 },
  creator: { tokens: 300, price: 19 },
  pro: { tokens: 800, price: 39 },
  team: { tokens: 2500, price: 99 }
};

const TOKEN_PACKS = {
  starter: { tokens: 100, price: 9.99 },
  power: { tokens: 300, price: 24.99 },
  creator: { tokens: 750, price: 49.99 },
  studio: { tokens: 2000, price: 99.99 }
};

// @route GET /api/v1/billing/plans
const getPlans = async (req, res) => {
  res.json(PLANS);
};

// @route POST /api/v1/billing/create-order
const createOrder = async (req, res) => {
  try {
    const { type, item } = req.body;

    let amount, tokens, label;

    if (type === 'plan') {
      if (!PLANS[item] || PLANS[item].price === 0) {
        return res.status(400).json({ message: 'Invalid plan or free plan selected' });
      }
      amount = PLANS[item].price * 100;
      tokens = PLANS[item].tokens;
      label = `${item} plan`;
    } else if (type === 'tokens') {
      if (!TOKEN_PACKS[item]) {
        return res.status(400).json({ message: 'Invalid token pack' });
      }
      amount = Math.round(TOKEN_PACKS[item].price * 100);
      tokens = TOKEN_PACKS[item].tokens;
      label = `${item} token pack`;
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amount * 83,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { userId: req.user._id.toString(), type, item, tokens }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      label
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/v1/billing/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type, item } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const user = await User.findById(req.user._id);

    if (type === 'plan') {
      user.plan = item;
      user.tokens = PLANS[item].tokens;
      await Transaction.create({
        userId: req.user._id,
        type: 'subscription',
        amount: PLANS[item].price * 100,
        tokens: PLANS[item].tokens,
        stripePaymentIntentId: razorpay_payment_id,
        status: 'success'
      });
    } else if (type === 'tokens') {
      user.tokens += TOKEN_PACKS[item].tokens;
      await Transaction.create({
        userId: req.user._id,
        type: 'credit_purchase',
        amount: Math.round(TOKEN_PACKS[item].price * 100),
        tokens: TOKEN_PACKS[item].tokens,
        stripePaymentIntentId: razorpay_payment_id,
        status: 'success'
      });
    }

    await user.save();
    res.json({ message: 'Payment verified', tokens: user.tokens, plan: user.plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/v1/billing/history
const getHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPlans, createOrder, verifyPayment, getHistory };