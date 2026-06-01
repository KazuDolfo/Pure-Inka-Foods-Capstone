const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/statsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/stats', protect, authorize('ADMIN'), getDashboardSummary);

module.exports = router;
