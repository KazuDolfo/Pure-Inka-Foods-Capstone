const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const [rows] = await pool.query(
        'SELECT id_usuario, nombre, email, rol, telefono FROM Usuario WHERE id_usuario = ?',
        [decoded.id]
      );

      if (rows.length === 0) {
        res.status(401);
        throw new Error('No autorizado, usuario no encontrado');
      }

      req.user = rows[0];
      next();
    } catch (error) {
      res.status(401);
      next(new Error('No autorizado, token fallido'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('No autorizado, no hay token'));
  }
};

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
