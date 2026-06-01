const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const userRepository = require('../repositories/userRepository');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await userRepository.findById(decoded.id);
      if (!user) {
        res.status(401);
        throw new Error('No autorizado, el usuario ya no existe');
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('No autorizado, token fallido');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no hay token');
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol.toUpperCase())) {
      res.status(403);
      throw new Error(`El rol ${req.user.rol} no tiene permisos para acceder a esta ruta`);
    }
    next();
  };
};

module.exports = { protect, authorize };
