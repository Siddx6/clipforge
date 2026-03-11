const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/plans', billingController.getPlans);
router.post('/create-order', protect, billingController.createOrder);
router.post('/verify', protect, billingController.verifyPayment);
router.get('/history', protect, billingController.getHistory);

module.exports = router;