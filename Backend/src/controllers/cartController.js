const pool = require('../config/db');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Obtener carrito del usuario autenticado
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id_usuario;

  // Asegurar que el usuario tenga un carrito (INSERT IGNORE)
  await pool.query('INSERT IGNORE INTO Carrito (id_usuario) VALUES (?)', [userId]);

  const [items] = await pool.query(
    `SELECT ci.id_carrito_item, ci.id_producto, ci.cantidad, p.nombre, p.precio, p.imagen_url, p.stock_actual 
     FROM Carrito c
     JOIN CarritoItem ci ON c.id_carrito = ci.id_carrito
     JOIN Producto p ON ci.id_producto = p.id_producto
     WHERE c.id_usuario = ?`,
    [userId]
  );

  res.json({
    success: true,
    data: items,
  });
});

/**
 * @desc    Añadir producto al carrito o actualizar cantidad
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = asyncHandler(async (req, res) => {
  const { id_producto, cantidad } = req.body;
  const userId = req.user.id_usuario;

  if (!id_producto || !cantidad) {
    res.status(400);
    throw new Error('Producto y cantidad son requeridos');
  }

  // 1. Obtener o crear carrito
  let [carts] = await pool.query('SELECT id_carrito FROM Carrito WHERE id_usuario = ?', [userId]);
  let id_carrito;

  if (carts.length === 0) {
    const [result] = await pool.query('INSERT INTO Carrito (id_usuario) VALUES (?)', [userId]);
    id_carrito = result.insertId;
  } else {
    id_carrito = carts[0].id_carrito;
  }

  // 2. Verificar stock antes de añadir
  const [products] = await pool.query('SELECT stock_actual FROM Producto WHERE id_producto = ?', [id_producto]);
  if (products.length === 0) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  if (products[0].stock_actual < cantidad) {
    res.status(400);
    throw new Error('Stock insuficiente');
  }

  // 3. Añadir o actualizar item
  await pool.query(
    `INSERT INTO CarritoItem (id_carrito, id_producto, cantidad) 
     VALUES (?, ?, ?) 
     ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)`,
    [id_carrito, id_producto, cantidad]
  );

  res.json({
    success: true,
    message: 'Carrito actualizado',
  });
});

/**
 * @desc    Eliminar un producto del carrito
 * @route   DELETE /api/cart/:id_producto
 * @access  Private
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id_usuario;
  const { id_producto } = req.params;

  await pool.query(
    `DELETE ci FROM CarritoItem ci
     JOIN Carrito c ON ci.id_carrito = c.id_carrito
     WHERE c.id_usuario = ? AND ci.id_producto = ?`,
    [userId, id_producto]
  );

  res.json({
    success: true,
    message: 'Producto eliminado del carrito',
  });
});

/**
 * @desc    Vaciar el carrito
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id_usuario;

  await pool.query(
    `DELETE ci FROM CarritoItem ci
     JOIN Carrito c ON ci.id_carrito = c.id_carrito
     WHERE c.id_usuario = ?`,
    [userId]
  );

  res.json({
    success: true,
    message: 'Carrito vaciado correctamente',
  });
});

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
