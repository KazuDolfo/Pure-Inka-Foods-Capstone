const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pure-inka/products',
    allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const voucherStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pure-inka/vouchers',
    allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

module.exports = {
  cloudinary,
  productStorage,
  voucherStorage
};
