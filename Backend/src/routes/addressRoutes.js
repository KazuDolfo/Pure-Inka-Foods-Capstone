const express = require('express');
const router = express.Router();
const { getCountries, getMyAddresses, addAddress } = require('../controllers/addressController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/countries', getCountries);
router.get('/', protect, getMyAddresses);
router.post('/', protect, addAddress);

module.exports = router;
