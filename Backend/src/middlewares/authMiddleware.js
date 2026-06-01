const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await userRepository.findById(decoded.id);

      if (!user) {
        res.status(401);
        throw new Error('No autorizado, usuario no encontrado');
      }

      req.user = user;
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
