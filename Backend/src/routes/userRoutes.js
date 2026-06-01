const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { 
  authUser, 
  authAdmin,
  registerUser, 
  getUserProfile, 
  updateUserProfile, 
  updateUserPassword,
  forgotPassword,
  verifyResetCode,
  resetPasswordWithCode
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.post(
  '/',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio').trim().escape(),
    body('email').isEmail().withMessage('Email no válido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    validateRequest
  ],
  registerUser
);

router.post('/login', authUser);
router.post('/admin-login', authAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyResetCode);
router.post('/reset-password', resetPasswordWithCode);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updateUserPassword);

module.exports = router;
