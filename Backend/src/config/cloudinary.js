const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let productStorage;
let voucherStorage;

if (process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'pure-inka/products',
      allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
  });

  voucherStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'pure-inka/vouchers',
      allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
  });
} else {
  const localDiskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, '../../public/uploads');
      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  productStorage = localDiskStorage;
  voucherStorage = localDiskStorage;
}

module.exports = {
  cloudinary,
  productStorage,
  voucherStorage
};
