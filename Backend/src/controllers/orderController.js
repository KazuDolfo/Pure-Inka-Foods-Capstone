const pool = require('../config/db');
const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @desc    Crear un Payment Intent de Stripe
 * @route   POST /api/orders/create-payment-intent
 * @access  Private
 */
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { total } = req.body;

  if (!total || total <= 0) {
    res.status(400);
    throw new Error('Monto total inválido');
  }

  // Monto en centavos
  const amount = Math.round(total * 100);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'pen',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe Error:', error.message);
    res.status(500);
    throw new Error(`Error al procesar con Stripe: ${error.message}`);
  }
});

/**
 * @desc    Crear un nuevo pedido
 * @route   POST /api/orders
 * @access  Private
 */
const addOrderItems = asyncHandler(async (req, res) => {
  const { 
    id_direccion, 
    orderItems, // [{id_producto, cantidad, precio_fijo}, ...]
    total,
    transaccion_id,
    estado_pago
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No hay productos en el pedido');
  }

  const id_usuario = req.user.id_usuario;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Crear el Pedido (Incluyendo estado_pago enviado por el frontend)
    const [orderResult] = await connection.query(
      'INSERT INTO Pedido (id_usuario, id_direccion, total, transaccion_id, estado_pago) VALUES (?, ?, ?, ?, ?)',
      [id_usuario, id_direccion, total, transaccion_id, estado_pago || 'PENDIENTE']
    );

    const id_pedido = orderResult.insertId;

    // 2. Crear los Detalles del Pedido y actualizar stock
    for (const item of orderItems) {
      // Insertar detalle
      await connection.query(
        'INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES (?, ?, ?, ?)',
        [id_pedido, item.id_producto, item.cantidad, item.precio_fijo]
      );

      // Actualizar stock
      const [stockResult] = await connection.query(
        'UPDATE Producto SET stock_actual = stock_actual - ? WHERE id_producto = ? AND stock_actual >= ?',
        [item.cantidad, item.id_producto, item.cantidad]
      );

      if (stockResult.affectedRows === 0) {
        throw new Error(`Stock insuficiente para el producto ID: ${item.id_producto}`);
      }

      // Registrar movimiento de stock
      await connection.query(
        'INSERT INTO MovimientoStock (id_producto, cantidad, tipo, motivo) VALUES (?, ?, ?, ?)',
        [item.id_producto, item.cantidad, 'SALIDA', `Venta Pedido #${id_pedido}`]
      );
    }

    await connection.commit();
    res.status(201).json({
      success: true,
      data: { id_pedido, total },
    });
  } catch (error) {
    await connection.rollback();
    res.status(400);
    throw error;
  } finally {
    connection.release();
  }
});

/**
 * @desc    Obtener mis pedidos
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM Pedido WHERE id_usuario = ? ORDER BY fecha DESC',
    [req.user.id_usuario]
  );
  res.json({
    success: true,
    data: rows,
  });
});

/**
 * @desc    Obtener un pedido por ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const [orderRows] = await pool.query(
    'SELECT p.*, u.nombre, u.email FROM Pedido p JOIN Usuario u ON p.id_usuario = u.id_usuario WHERE p.id_pedido = ?',
    [req.params.id]
  );
  
  const order = orderRows[0];

  if (order) {
    // Verificar que el usuario sea el dueño del pedido o sea ADMIN
    if (order.id_usuario !== req.user.id_usuario && req.user.rol !== 'ADMIN') {
      res.status(403);
      throw new Error('No autorizado para ver este pedido');
    }

    // Obtener detalles del pedido
    const [details] = await pool.query(
      'SELECT dp.*, pr.nombre as producto_nombre, pr.sku FROM DetallePedido dp JOIN Producto pr ON dp.id_producto = pr.id_producto WHERE dp.id_pedido = ?',
      [req.params.id]
    );

    order.items = details;

    res.json({
      success: true,
      data: order,
    });
  } else {
    res.status(404);
    throw new Error('Pedido no encontrado');
  }
});

/**
 * @desc    Obtener todos los pedidos (Admin)
 * @route   GET /api/orders/admin
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT p.*, u.nombre, u.email
    FROM Pedido p
    JOIN Usuario u ON p.id_usuario = u.id_usuario
    ORDER BY p.fecha DESC
  `);
  res.json({ success: true, data: rows });
});

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getAllOrders,
  createPaymentIntent
};
