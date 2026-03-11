const express = require('express');
const router = express.Router();
const affiliateController = require('../controllers/affiliate.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/stats', protect, affiliateController.getAffiliateStats);
router.post('/track/:affiliateCode', affiliateController.trackClick);

module.exports = router;