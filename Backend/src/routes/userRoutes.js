const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { 
  authUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile, 
  updateUserPassword,
  forgotPassword,
  verifyResetCode,
  resetPasswordWithCode
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const authAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM Usuario WHERE email = ?', [email]);
  const user = rows[0];

  if (user && (await bcrypt.compare(password, user.contrasena))) {
    if (user.rol !== 'ADMIN' && user.rol !== 'administrador') {
      res.status(403);
      throw new Error('No tiene permisos administrativos');
    }
    res.json({
      success: true,
      data: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
        token: generateToken(user.id_usuario),
      },
    });
  } else {
    res.status(401);
    throw new Error('Email o contraseña de administrador inválidos');
  }
});

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
