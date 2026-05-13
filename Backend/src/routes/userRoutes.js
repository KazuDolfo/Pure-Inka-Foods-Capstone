const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile, updateUserProfile, updateUserPassword } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updateUserPassword);

module.exports = router;
