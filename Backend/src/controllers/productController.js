const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const asyncHandler = require('express-async-handler');

const getProducts = asyncHandler(async (req, res) => {
  const { search, category } = req.query;
  let query = `
    SELECT p.*, c.nombre as category_name 
    FROM Producto p
    LEFT JOIN Categoria c ON p.id_categoria = c.id_categoria
    WHERE p.activo = TRUE
  `;
  const params = [];

  if (search) {
    query += ' AND (p.nombre LIKE ? OR p.sku LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    query += ' AND p.id_categoria = ?';
    params.push(category);
  }

  const [rows] = await pool.query(query, params);
  res.json({
    success: true,
    data: rows,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Producto WHERE id_producto = ?', [req.params.id]);
  const product = rows[0];

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

  const [result] = await pool.query(
    'INSERT INTO Producto (sku, nombre, precio, stock_actual, imagen_url, descripcion, id_categoria) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [sku, nombre, precio, stock_actual, imagen_url, descripcion || '', categoriaId]
  );

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

    const [rows] = await connection.query('SELECT stock_actual FROM Producto WHERE id_producto = ?', [id_producto]);
    if (rows.length === 0) {
      throw new Error('Producto no encontrado');
    }

    const currentStock = rows[0].stock_actual;
    let newStock = currentStock;

    if (tipo === 'ENTRADA') {
      newStock += cantidad;
    } else if (tipo === 'SALIDA') {
      if (currentStock < cantidad) {
        throw new Error('Stock insuficiente');
      }
      newStock -= cantidad;
    } else {
      throw new Error('Tipo de movimiento inválido');
    }

    await connection.query('UPDATE Producto SET stock_actual = ? WHERE id_producto = ?', [newStock, id_producto]);

    await connection.query(
      'INSERT INTO MovimientoStock (id_producto, cantidad, tipo, motivo) VALUES (?, ?, ?, ?)',
      [id_producto, cantidad, tipo, motivo]
    );

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

  const [oldRows] = await pool.query('SELECT imagen_url FROM Producto WHERE id_producto = ?', [id_producto]);
  const oldImageUrl = oldRows.length > 0 ? oldRows[0].imagen_url : null;

  const imagen_url = req.file ? req.file.filename : (req.body.imagen_url || null);

  let query = 'UPDATE Producto SET ';
  const params = [];
  
  if (sku) { query += 'sku = ?, '; params.push(sku); }
  if (nombre) { query += 'nombre = ?, '; params.push(nombre); }
  if (precio) { query += 'precio = ?, '; params.push(precio); }
  if (descripcion) { query += 'descripcion = ?, '; params.push(descripcion); }
  if (id_categoria) { query += 'id_categoria = ?, '; params.push(id_categoria); }
  if (imagen_url) { query += 'imagen_url = ?, '; params.push(imagen_url); }
  if (activo !== undefined) { query += 'activo = ?, '; params.push(activo); }

  if (params.length === 0) {
    res.status(400);
    throw new Error('No se enviaron campos para actualizar');
  }

  query = query.slice(0, -2);
  query += ' WHERE id_producto = ?';
  params.push(id_producto);

  const [result] = await pool.query(query, params);

  if (result.affectedRows > 0) {
    // Si se subió una nueva imagen con éxito, borrar la anterior
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

  const [result] = await pool.query('UPDATE Producto SET activo = FALSE WHERE id_producto = ?', [id_producto]);

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
  createProduct,
  updateProductStock,
  updateProduct,
  deleteProduct,
};
