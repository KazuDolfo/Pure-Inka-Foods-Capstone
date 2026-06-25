const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, clearCart, syncCart } = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.post('/sync', syncCart);
router.delete('/:id_producto', removeFromCart);

module.exports = router;
