const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // Todas las rutas de carrito requieren login

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.delete('/:id_producto', removeFromCart);

module.exports = router;
