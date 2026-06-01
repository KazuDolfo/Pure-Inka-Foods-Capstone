const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const processProductImage = async (req, res, next) => {
  if (!req.file) return next();

  const fileName = `product-${Date.now()}.webp`;
  const outputPath = path.join('public/uploads/products/', fileName);

  try {
    await sharp(req.file.buffer)
      .resize(1000, 1000, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat('webp')
      .webp({ quality: 80 })
      .toFile(outputPath);

    req.file.filename = fileName;
    req.file.path = outputPath;
    
    next();
  } catch (error) {
    next(new Error('Error al procesar la imagen: ' + error.message));
  }
};

const processVoucherImage = async (req, res, next) => {
  if (!req.file) return next();

  const fileName = `voucher-${Date.now()}.webp`;
  const outputPath = path.join('public/uploads/vouchers/', fileName);

  try {
    await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat('webp')
      .webp({ quality: 70 })
      .toFile(outputPath);

    req.file.filename = fileName;
    req.file.path = outputPath;
    
    next();
  } catch (error) {
    next(new Error('Error al procesar el comprobante: ' + error.message));
  }
};

module.exports = { processProductImage, processVoucherImage };
