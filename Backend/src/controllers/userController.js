const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');
const { BCRYPT_SALT_ROUNDS } = require('../utils/constants');

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userRepository.findByEmail(email);

  if (user && (await bcrypt.compare(password, user.contrasena))) {
    if (user.rol.toUpperCase() === 'ADMIN') {
      res.status(401);
      throw new Error('Ingrese por el acceso de administrador');
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

const authAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await userRepository.findByEmail(email);

  if (user && (await bcrypt.compare(password, user.contrasena))) {
    if (user.rol.toUpperCase() !== 'ADMIN') {
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

const registerUser = asyncHandler(async (req, res) => {
  const { nombre, email, password, telefono } = req.body;

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);

  const result = await userRepository.create({
    nombre,
    email,
    hashedPassword,
    telefono
  });

  if (result.affectedRows > 0) {
    const newUserId = result.insertId;
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
    const exists = await userRepository.existsEmailExcludeUser(email, userId);
    if (exists) {
      res.status(400);
      throw new Error('El email ya está en uso');
    }
  }

  const result = await userRepository.updateProfile(userId, {
    nombre: nombre || req.user.nombre,
    email: email || req.user.email,
    telefono: telefono || req.user.telefono
  });

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

  const user = await userRepository.findById(userId);

  if (user && (await bcrypt.compare(currentPassword, user.contrasena))) {
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await userRepository.updatePassword(userId, hashedPassword);

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

  const user = await userRepository.findByIdentifier(identifier);
  
  if (!user) {
    res.status(404);
    throw new Error('No se encontró ningún usuario con ese correo o teléfono');
  }

  const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiration = new Date(Date.now() + 15 * 60 * 1000);

  await userRepository.setRecoveryCode(user.id_usuario, recoveryCode, expiration);

  res.json({
    success: true,
    message: 'Se ha generado un código de recuperación.'
  });
});

const verifyResetCode = asyncHandler(async (req, res) => {
  const { identifier, code } = req.body;

  const user = await userRepository.findByRecoveryCode(identifier, code);

  if (user) {
    res.json({ success: true, message: 'Código verificado con éxito' });
  } else {
    res.status(400);
    throw new Error('El código es inválido o ha expirado');
  }
});

const resetPasswordWithCode = asyncHandler(async (req, res) => {
  const { identifier, code, newPassword } = req.body;

  const user = await userRepository.findByRecoveryCode(identifier, code);

  if (!user) {
    res.status(400);
    throw new Error('No se pudo verificar la solicitud. Intente nuevamente.');
  }

  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await userRepository.resetPassword(user.id_usuario, hashedPassword);

  res.json({ success: true, message: 'Contraseña restablecida correctamente' });
});

module.exports = {
  authUser,
  authAdmin,
  registerUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  forgotPassword,
  verifyResetCode,
  resetPasswordWithCode
};
