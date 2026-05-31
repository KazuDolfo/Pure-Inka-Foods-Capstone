const express = require('express');
const router = express.Router();
const { 
  getSalesStats, 
  getCategoryStats, 
  getGeoStats, 
  getInventoryStats,
  getDashboardSummary
} = require('../controllers/statsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/sales', getSalesStats);
router.get('/categories', getCategoryStats);
router.get('/geography', getGeoStats);
router.get('/inventory', getInventoryStats);
router.get('/dashboard', getDashboardSummary);

module.exports = router;
