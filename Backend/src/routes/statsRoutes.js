const express = require('express');
const router = express.Router();
const { 
  getSalesStats, 
  getCategoryStats, 
  getGeoStats, 
  getInventoryStats 
} = require('../controllers/statsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Proteger todas las rutas: Solo Administradores
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/sales', getSalesStats);
router.get('/categories', getCategoryStats);
router.get('/geography', getGeoStats);
router.get('/inventory', getInventoryStats);

module.exports = router;
