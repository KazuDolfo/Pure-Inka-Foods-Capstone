const bcrypt = require('bcrypt');
const pool = require('../config/db');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Autenticar usuario y obtener token
 * @route   POST /api/users/login
 * @access  Public
 */
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Buscar el usuario por email
  const [rows] = await pool.query('SELECT * FROM Usuario WHERE email = ?', [email]);
  const user = rows[0];

  // Si existe el usuario y la contraseña es correcta
  if (user && (await bcrypt.compare(password, user.contrasena))) {
    res.json({
      success: true,
      data: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        token: generateToken(user.id_usuario),
      },
    });
  } else {
    res.status(401);
    throw new Error('Email o contraseña inválidos');
  }
});

/**
 * @desc    Registrar un nuevo usuario
 * @route   POST /api/users
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { nombre, email, password, telefono } = req.body;

  // Verificar si el usuario ya existe
  const [existingUser] = await pool.query('SELECT * FROM Usuario WHERE email = ?', [email]);
  if (existingUser.length > 0) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  // Hashear la contraseña
  const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insertar el nuevo usuario en la base de datos
  const [result] = await pool.query(
    'INSERT INTO Usuario (nombre, email, contrasena, telefono) VALUES (?, ?, ?, ?)',
    [nombre, email, hashedPassword, telefono]
  );

  const newUserId = result.insertId;

  if (result.affectedRows > 0) {
    res.status(201).json({
      success: true,
      data: {
        id_usuario: newUserId,
        nombre,
        email,
        rol: 'CLIENTE',
        token: generateToken(newUserId),
      },
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
  }
});

/**
 * @desc    Obtener el perfil del usuario autenticado
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user viene del middleware 'protect'
  if (req.user) {
    res.json({
      success: true,
      data: req.user,
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

/**
 * @desc    Actualizar el perfil del usuario
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const { nombre, email, telefono } = req.body;
  const userId = req.user.id_usuario;

  // Verificar si el email ya está en uso por otro usuario
  if (email && email !== req.user.email) {
    const [existingUser] = await pool.query('SELECT * FROM Usuario WHERE email = ? AND id_usuario != ?', [email, userId]);
    if (existingUser.length > 0) {
      res.status(400);
      throw new Error('El email ya está en uso');
    }
  }

  const [result] = await pool.query(
    'UPDATE Usuario SET nombre = ?, email = ?, telefono = ? WHERE id_usuario = ?',
    [nombre || req.user.nombre, email || req.user.email, telefono || req.user.telefono, userId]
  );

  if (result.affectedRows > 0) {
    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: {
        id_usuario: userId,
        nombre: nombre || req.user.nombre,
        email: email || req.user.email,
        telefono: telefono || req.user.telefono,
        rol: req.user.rol
      }
    });
  } else {
    res.status(400);
    throw new Error('No se pudo actualizar el perfil');
  }
});

/**
 * @desc    Actualizar la contraseña del usuario
 * @route   PUT /api/users/password
 * @access  Private
 */
const updateUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id_usuario;

  // Obtener el usuario actual
  const [rows] = await pool.query('SELECT contrasena FROM Usuario WHERE id_usuario = ?', [userId]);
  const user = rows[0];

  if (user && (await bcrypt.compare(currentPassword, user.contrasena))) {
    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const [result] = await pool.query(
      'UPDATE Usuario SET contrasena = ? WHERE id_usuario = ?',
      [hashedPassword, userId]
    );

    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: 'Contraseña actualizada correctamente'
      });
    } else {
      res.status(400);
      throw new Error('No se pudo actualizar la contraseña');
    }
  } else {
    res.status(401);
    throw new Error('La contraseña actual es incorrecta');
  }
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
};
