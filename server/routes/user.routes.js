const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/stats', userController.getUserStats);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);
router.delete('/account', userController.deleteAccount);

module.exports = router;