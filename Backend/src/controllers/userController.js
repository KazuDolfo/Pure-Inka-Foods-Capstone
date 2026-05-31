const bcrypt = require('bcrypt');
const pool = require('../config/db');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query('SELECT * FROM Usuario WHERE email = ?', [email]);
  const user = rows[0];

  if (user && (await bcrypt.compare(password, user.contrasena))) {
    // RESTRICCIÓN: Bloquear Administradores en el Login Normal
    if (user.rol === 'ADMIN' || user.rol === 'administrador') {
        res.status(401);
        throw new Error('Ingrese Por El Acceso de Admin');
    }

    res.json({
      success: true,
      data: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
        fecha_registro: user.fecha_registro,
        token: generateToken(user.id_usuario),
      },
    });
  } else {
    res.status(401);
    throw new Error('Email o contraseña inválidos');
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { nombre, email, password, telefono } = req.body;

  const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('El formato del correo electrónico no es válido');
  }

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  const [existingUser] = await pool.query('SELECT * FROM Usuario WHERE email = ?', [email]);
  if (existingUser.length > 0) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
  const hashedPassword = await bcrypt.hash(password, salt);

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
        telefono,
        rol: 'CLIENTE',
        token: generateToken(newUserId),
      },
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
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

const updateUserProfile = asyncHandler(async (req, res) => {
  const { nombre, email, telefono } = req.body;
  const userId = req.user.id_usuario;

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

const updateUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id_usuario;

  const [rows] = await pool.query('SELECT contrasena FROM Usuario WHERE id_usuario = ?', [userId]);
  const user = rows[0];

  if (user && (await bcrypt.compare(currentPassword, user.contrasena))) {
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

const forgotPassword = asyncHandler(async (req, res) => {
  const { identifier } = req.body;

  const [rows] = await pool.query(
    'SELECT id_usuario, email, telefono FROM Usuario WHERE email = ? OR telefono = ?',
    [identifier, identifier]
  );
  
  const user = rows[0];
  if (!user) {
    res.status(404);
    throw new Error('No se encontró ningún usuario con ese correo o teléfono');
  }

  const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiration = new Date(Date.now() + 15 * 60 * 1000);

  await pool.query(
    'UPDATE Usuario SET codigo_recuperacion = ?, codigo_expiracion = ? WHERE id_usuario = ?',
    [recoveryCode, expiration, user.id_usuario]
  );

  res.json({
    success: true,
    message: 'Se ha generado un código de recuperación.'
  });
});

const verifyResetCode = asyncHandler(async (req, res) => {
  const { identifier, code } = req.body;

  const [rows] = await pool.query(
    'SELECT id_usuario FROM Usuario WHERE (email = ? OR telefono = ?) AND codigo_recuperacion = ? AND codigo_expiracion > NOW()',
    [identifier, identifier, code]
  );

  if (rows.length > 0) {
    res.json({ success: true, message: 'Código verificado con éxito' });
  } else {
    res.status(400);
    throw new Error('El código es inválido o ha expirado');
  }
});

const resetPasswordWithCode = asyncHandler(async (req, res) => {
  const { identifier, code, newPassword } = req.body;

  const [rows] = await pool.query(
    'SELECT id_usuario FROM Usuario WHERE (email = ? OR telefono = ?) AND codigo_recuperacion = ? AND codigo_expiracion > NOW()',
    [identifier, identifier, code]
  );

  if (rows.length === 0) {
    res.status(400);
    throw new Error('No se pudo verificar la solicitud. Intente nuevamente.');
  }

  const userId = rows[0].id_usuario;
  const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await pool.query(
    'UPDATE Usuario SET contrasena = ?, codigo_recuperacion = NULL, codigo_expiracion = NULL WHERE id_usuario = ?',
    [hashedPassword, userId]
  );

  res.json({ success: true, message: 'Contraseña restablecida correctamente' });
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  forgotPassword,
  verifyResetCode,
  resetPasswordWithCode
};
