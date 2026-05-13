const express = require('express');
const router = express.Router();
const { 
  addOrderItems, 
  getMyOrders, 
  getOrderById, 
  getAllOrders,
  createPaymentIntent 
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect); // Todas las rutas de órdenes requieren login

router.post('/', addOrderItems);
router.post('/create-payment-intent', createPaymentIntent);
router.get('/myorders', getMyOrders);
router.get('/admin', authorize('ADMIN'), getAllOrders);
router.get('/:id', getOrderById);

module.exports = router;
