const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProductStock, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const { processProductImage } = require('../middlewares/imageMiddleware');

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Solo se permiten imágenes (jpg, jpeg, png, webp)');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorize('ADMIN'), upload.single('image'), processProductImage, createProduct);
router.put('/:id', protect, authorize('ADMIN'), upload.single('image'), processProductImage, updateProduct);
router.put('/:id/stock', protect, authorize('ADMIN'), updateProductStock);
router.delete('/:id', protect, authorize('ADMIN'), deleteProduct);

module.exports = router;
