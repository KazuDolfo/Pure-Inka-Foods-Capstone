const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  addOrderItems, 
  getMyOrders, 
  getOrderById, 
  getAllOrders,
  createPaymentIntent,
  updateOrderStatus,
  generateOrderPDF
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { voucherStorage } = require('../config/cloudinary');

const upload = multer({ storage: voucherStorage });

router.use(protect);

router.post('/', upload.single('voucher'), addOrderItems);
router.post('/create-payment-intent', createPaymentIntent);
router.get('/myorders', getMyOrders);
router.get('/admin', authorize('ADMIN'), getAllOrders);
router.get('/:id', getOrderById);
router.get('/:id/pdf', generateOrderPDF);
router.put('/:id/status', authorize('ADMIN'), updateOrderStatus);

module.exports = router;
