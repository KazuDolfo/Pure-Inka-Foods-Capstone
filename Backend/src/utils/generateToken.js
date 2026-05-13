const jwt = require('jsonwebtoken');

/**
 * Genera un token JWT para un usuario.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Expira en 30 días (ideal para dev)
  });
};

module.exports = generateToken;
