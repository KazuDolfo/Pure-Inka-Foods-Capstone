const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
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

const { processVoucherImage } = require('../middlewares/imageMiddleware');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, webp)'));
    }
  },
});

router.use(protect);

router.post('/', upload.single('voucher'), processVoucherImage, addOrderItems);
router.post('/create-payment-intent', createPaymentIntent);
router.get('/myorders', getMyOrders);
router.get('/admin', authorize('ADMIN'), getAllOrders);
router.get('/:id', getOrderById);
router.get('/:id/pdf', generateOrderPDF);
router.put('/:id/status', authorize('ADMIN'), updateOrderStatus);

module.exports = router;
