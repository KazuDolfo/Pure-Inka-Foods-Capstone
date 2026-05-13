const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Middleware para proteger rutas que requieren autenticación.
 * Verifica la validez del token JWT y añade el usuario a la solicitud.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener el token del encabezado (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener el usuario de la base de datos (sin la contraseña)
      const [rows] = await pool.query(
        'SELECT id_usuario, nombre, email, rol, telefono FROM Usuario WHERE id_usuario = ?',
        [decoded.id]
      );

      if (rows.length === 0) {
        res.status(401);
        throw new Error('No autorizado, usuario no encontrado');
      }

      // Añadir la información del usuario al objeto request
      req.user = rows[0];
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401);
      next(new Error('No autorizado, token fallido'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('No autorizado, no hay token'));
  }
};

/**
 * Middleware para restringir el acceso basado en roles.
 * Debe usarse después de 'protect'.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403);
      return next(new Error(`No tienes permisos para acceder a este recurso. Se requiere rol: ${roles.join(' o ')}`));
    }
    next();
  };
};

module.exports = { protect, authorize };
