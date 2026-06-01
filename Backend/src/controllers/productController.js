const fs = require('fs');
const path = require('path');
const productRepository = require('../repositories/productRepository');
const pool = require('../config/db');
const asyncHandler = require('express-async-handler');

const getProducts = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 9 } = req.query;
  const offset = (page - 1) * limit;

  const rows = await productRepository.findAll({ search, category, limit, offset });
  const total = await productRepository.countAll({ search, category });

  res.json({
    success: true,
    data: rows,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

const getSuggestedProducts = asyncHandler(async (req, res) => {
  const product = await productRepository.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  const suggested = await productRepository.findSuggested(product.id_categoria, product.id_producto);
  res.json({
    success: true,
    data: suggested
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productRepository.findById(req.params.id);

  if (product) {
    res.json({
      success: true,
      data: product,
    });
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

const createProduct = asyncHandler(async (req, res) => {
  const { sku, nombre, precio, stock_actual, descripcion, id_categoria } = req.body;
  
  const imagen_url = req.file ? req.file.filename : (req.body.imagen_url || 'pure-inka-logo.png');
  const categoriaId = id_categoria && id_categoria !== '' ? id_categoria : null;

  const result = await productRepository.create({
    sku,
    nombre,
    precio,
    stock_actual,
    imagen_url,
    descripcion,
    id_categoria: categoriaId
  });

  if (result.affectedRows > 0) {
    res.status(201).json({
      success: true,
      data: {
        id_producto: result.insertId,
        sku,
        nombre,
        precio,
        stock_actual,
        descripcion,
        imagen_url,
      },
    });
  } else {
    res.status(400);
    throw new Error('Datos de producto inválidos');
  }
});

const updateProductStock = asyncHandler(async (req, res) => {
  const { cantidad, tipo, motivo } = req.body;
  const id_producto = req.params.id;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const currentStock = await productRepository.getStock(id_producto, connection);
    if (currentStock === null) {
      throw new Error('Producto no encontrado');
    }

    let newStock = currentStock;

    if (tipo === 'ENTRADA') {
      newStock += Number(cantidad);
    } else if (tipo === 'SALIDA') {
      if (currentStock < cantidad) {
        throw new Error('Stock insuficiente');
      }
      newStock -= Number(cantidad);
    } else {
      throw new Error('Tipo de movimiento inválido');
    }

    await productRepository.updateStock(id_producto, newStock, connection);

    await productRepository.createStockMovement({
      id_producto,
      cantidad,
      tipo,
      motivo
    }, connection);

    await connection.commit();
    res.json({
      success: true,
      message: 'Stock actualizado correctamente',
      data: { id_producto, newStock },
    });
  } catch (error) {
    await connection.rollback();
    res.status(400);
    throw error;
  } finally {
    connection.release();
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { sku, nombre, precio, descripcion, id_categoria, activo } = req.body;
  const id_producto = req.params.id;

  const oldProduct = await productRepository.findById(id_producto);
  const oldImageUrl = oldProduct ? oldProduct.imagen_url : null;

  const imagen_url = req.file ? req.file.filename : (req.body.imagen_url || undefined);

  const productData = {
    sku,
    nombre,
    precio,
    descripcion,
    id_categoria,
    imagen_url,
    activo
  };

  const result = await productRepository.update(id_producto, productData);

  if (result && result.affectedRows > 0) {
    if (req.file && oldImageUrl && oldImageUrl !== 'pure-inka-logo.png') {
      const oldPath = path.join(__dirname, '../../public/uploads/products/', oldImageUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    res.json({
      success: true,
      message: 'Producto actualizado correctamente',
    });
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const id_producto = req.params.id;
  const result = await productRepository.delete(id_producto);

  if (result.affectedRows > 0) {
    res.json({
      success: true,
      message: 'Producto eliminado correctamente',
    });
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

module.exports = {
  getProducts,
  getProductById,
  getSuggestedProducts,
  createProduct,
  updateProductStock,
  updateProduct,
  deleteProduct,
};
