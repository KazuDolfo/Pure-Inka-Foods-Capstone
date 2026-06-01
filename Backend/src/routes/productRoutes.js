const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getProducts, getProductById, createProduct, updateProductStock, updateProduct, deleteProduct, getSuggestedProducts } = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { productStorage } = require('../config/cloudinary');

const upload = multer({ storage: productStorage });

router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/suggested', getSuggestedProducts);
router.post('/', protect, authorize('ADMIN'), upload.single('image'), createProduct);
router.put('/:id', protect, authorize('ADMIN'), upload.single('image'), updateProduct);
router.put('/:id/stock', protect, authorize('ADMIN'), updateProductStock);
router.delete('/:id', protect, authorize('ADMIN'), deleteProduct);

module.exports = router;
