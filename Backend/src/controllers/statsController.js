const pool = require('../config/db');
const asyncHandler = require('express-async-handler');

const getSalesStats = asyncHandler(async (req, res) => {
  const [summary] = await pool.query(`
    SELECT 
      IFNULL(SUM(total), 0) as ingresos_totales,
      COUNT(*) as total_pedidos,
      IFNULL(AVG(total), 0) as ticket_promedio
    FROM Pedido 
    WHERE estado_pago = 'PAGADO'
  `);

  const [monthly] = await pool.query(`
    SELECT 
      DATE_FORMAT(fecha, '%Y-%m') as mes,
      SUM(total) as monto,
      COUNT(*) as cantidad_pedidos
    FROM Pedido
    WHERE estado_pago = 'PAGADO'
    GROUP BY mes
    ORDER BY mes DESC
    LIMIT 6
  `);

  res.json({
    success: true,
    data: {
      resumen: summary[0],
      mensual: monthly
    }
  });
});

const getCategoryStats = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      c.nombre as categoria,
      SUM(dp.cantidad) as unidades_vendidas,
      SUM(dp.cantidad * dp.precio_fijo) as ingresos_por_categoria
    FROM Categoria c
    JOIN Producto p ON c.id_categoria = p.id_categoria
    JOIN DetallePedido dp ON p.id_producto = dp.id_producto
    JOIN Pedido ped ON dp.id_pedido = ped.id_pedido
    WHERE ped.estado_pago = 'PAGADO'
    GROUP BY c.id_categoria
    ORDER BY ingresos_por_categoria DESC
  `);

  res.json({ success: true, data: rows });
});

const getGeoStats = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      pa.nombre as pais,
      COUNT(p.id_pedido) as total_pedidos,
      SUM(p.total) as monto_total
    FROM Pedido p
    JOIN Direccion d ON p.id_direccion = d.id_direccion
    JOIN Pais pa ON d.id_pais = pa.id_pais
    GROUP BY pa.id_pais
    ORDER BY total_pedidos DESC
  `);

  res.json({ success: true, data: rows });
});

const getInventoryStats = asyncHandler(async (req, res) => {
  const [alerts] = await pool.query(`
    SELECT id_producto, nombre, stock_actual, sku
    FROM Producto
    WHERE stock_actual < 10 AND activo = TRUE
  `);

  const [valuation] = await pool.query(`
    SELECT 
      IFNULL(SUM(stock_actual * precio), 0) as valor_total_inventario,
      IFNULL(SUM(stock_actual), 0) as total_items_stock
    FROM Producto
    WHERE activo = TRUE
  `);

  res.json({
    success: true,
    data: {
      alertas: alerts,
      valorizacion: valuation[0]
    }
  });
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const range = req.query.range || '30d';
  let days = 30;
  if (range === 'today') days = 1;
  else if (range === '7d') days = 7;
  else if (range === 'year') days = 365;

  const [salesResult] = await pool.query(`
    SELECT IFNULL(SUM(total), 0) as totalSales 
    FROM Pedido 
    WHERE estado_pago = 'PAGADO' AND fecha >= DATE_SUB(NOW(), INTERVAL ? DAY)
  `, [days]);

  const [ordersResult] = await pool.query(`
    SELECT COUNT(*) as pendingOrders 
    FROM Pedido 
    WHERE estado_envio IN ('PENDIENTE', 'PROCESANDO')
  `);

  const [stockResult] = await pool.query(`
    SELECT COUNT(*) as lowStockCount 
    FROM Producto 
    WHERE stock_actual < 10 AND activo = TRUE
  `);

  const [chatsResult] = await pool.query(`
    SELECT COUNT(*) as activeChats 
    FROM Conversacion
  `);

  const [timelineResult] = await pool.query(`
    SELECT 
      DATE_FORMAT(fecha, '%d/%m') as label,
      SUM(total) as value
    FROM Pedido
    WHERE estado_pago = 'PAGADO' AND fecha >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(fecha), label
    ORDER BY DATE(fecha) ASC
  `, [days]);

  const [categoryResult] = await pool.query(`
    SELECT 
      c.nombre as label,
      SUM(dp.cantidad) as value
    FROM Categoria c
    JOIN Producto p ON c.id_categoria = p.id_categoria
    JOIN DetallePedido dp ON p.id_producto = dp.id_producto
    JOIN Pedido ped ON dp.id_pedido = ped.id_pedido
    WHERE ped.estado_pago = 'PAGADO'
    GROUP BY c.id_categoria
    ORDER BY value DESC
    LIMIT 5
  `);

  const [userResult] = await pool.query(`
    SELECT 
      DATE_FORMAT(fecha_registro, '%d/%m') as label,
      COUNT(*) as value
    FROM Usuario
    WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(fecha_registro), label
    ORDER BY DATE(fecha_registro) ASC
  `, [days]);

  const [topProductResult] = await pool.query(`
    SELECT 
      p.nombre as label,
      SUM(dp.cantidad) as value
    FROM Producto p
    JOIN DetallePedido dp ON p.id_producto = dp.id_producto
    JOIN Pedido ped ON dp.id_pedido = ped.id_pedido
    WHERE ped.estado_pago = 'PAGADO'
    GROUP BY p.id_producto
    ORDER BY value DESC
    LIMIT 5
  `);

  const [paymentResult] = await pool.query(`
    SELECT 
      IFNULL(metodo_pago, 'Otro') as label,
      COUNT(*) as value
    FROM Pedido
    WHERE estado_pago = 'PAGADO'
    GROUP BY metodo_pago
    ORDER BY value DESC
  `);

  res.json({
    success: true,
    data: {
      totalSales: parseFloat(salesResult[0].totalSales),
      pendingOrders: ordersResult[0].pendingOrders,
      lowStockCount: stockResult[0].lowStockCount,
      activeChats: chatsResult[0].activeChats,
      salesTimeline: {
        labels: timelineResult.map(t => t.label),
        data: timelineResult.map(t => t.value)
      },
      categoryStats: {
        labels: categoryResult.map(c => c.label),
        data: categoryResult.map(c => c.value)
      },
      userRegistrations: {
        labels: userResult.map(u => u.label),
        data: userResult.map(u => u.value)
      },
      topProducts: {
        labels: topProductResult.map(p => p.label),
        data: topProductResult.map(p => p.value)
      },
      paymentMethods: {
        labels: paymentResult.map(p => p.label),
        data: paymentResult.map(p => p.value)
      }
    }
  });
});

module.exports = { 
  getSalesStats, 
  getCategoryStats, 
  getGeoStats, 
  getInventoryStats,
  getDashboardSummary
};
