const pool = require('../config/db');
const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const createPaymentIntent = asyncHandler(async (req, res) => {
  const { total } = req.body;
  if (!total || total <= 0) {
    res.status(400);
    throw new Error('Monto total inválido');
  }
  const amount = Math.round(total * 100);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'pen',
      automatic_payment_methods: { enabled: true },
    });
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500);
    throw new Error(`Error al procesar con Stripe: ${error.message}`);
  }
});

const addOrderItems = asyncHandler(async (req, res) => {
  let { id_direccion, orderItems, total, transaccion_id, estado_pago, metodo_pago, tipo_comprobante, ruc, razon_social } = req.body;
  if (typeof orderItems === 'string') orderItems = JSON.parse(orderItems);
  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No hay productos en el pedido');
  }
  const id_usuario = req.user.id_usuario;
  const comprobante_url = req.file ? req.file.path : null;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [orderResult] = await connection.query(
      'INSERT INTO Pedido (id_usuario, id_direccion, total, transaccion_id, estado_pago, comprobante_url, metodo_pago, tipo_comprobante, ruc, razon_social) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id_usuario, id_direccion, total, transaccion_id, estado_pago || 'PENDIENTE', comprobante_url, metodo_pago, tipo_comprobante || 'BOLETA', ruc, razon_social]
    );
    const id_pedido = orderResult.insertId;
    for (const item of orderItems) {
      await connection.query('INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES (?, ?, ?, ?)', [id_pedido, item.id_producto, item.cantidad, item.precio_fijo]);
      const [stockResult] = await connection.query('UPDATE Producto SET stock_actual = stock_actual - ? WHERE id_producto = ? AND stock_actual >= ?', [item.cantidad, item.id_producto, item.cantidad]);
      if (stockResult.affectedRows === 0) throw new Error(`Stock insuficiente para el producto ID: ${item.id_producto}`);
      await connection.query('INSERT INTO MovimientoStock (id_producto, cantidad, tipo, motivo) VALUES (?, ?, ?, ?)', [item.id_producto, item.cantidad, 'SALIDA', `Venta Pedido #${id_pedido}`]);
    }
    await connection.commit();
    res.status(201).json({ success: true, data: { id_pedido, total } });
  } catch (error) {
    await connection.rollback();
    res.status(400);
    throw error;
  } finally {
    connection.release();
  }
});

const generateOrderPDF = asyncHandler(async (req, res) => {
  const id_pedido = req.params.id;
  if (!id_pedido) {
    res.status(400);
    throw new Error('ID de pedido es obligatorio');
  }

  const [orderRows] = await pool.query(
    'SELECT p.*, u.nombre as cliente_nombre, u.email as cliente_email FROM Pedido p JOIN Usuario u ON p.id_usuario = u.id_usuario WHERE p.id_pedido = ?',
    [id_pedido]
  );
  
  const order = orderRows[0];
  if (!order) {
    res.status(404);
    throw new Error(`El pedido #${id_pedido} no existe en el sistema`);
  }

  if (order.id_usuario !== req.user.id_usuario && req.user.rol !== 'ADMIN') {
    res.status(403);
    throw new Error('No tienes permisos para ver este comprobante');
  }

  if (order.estado_pago !== 'PAGADO') {
    res.status(400);
    throw new Error('El comprobante solo está disponible para pedidos con estado PAGADO');
  }

  const fileName = `comprobante-${order.id_pedido}.pdf`;
  const folderPath = path.join(__dirname, '../../public/receipts');
  const filePath = path.join(folderPath, fileName);
  const fileUrl = `/public/receipts/${fileName}`;

  if (order.comprobante_pdf_url && fs.existsSync(filePath)) {
    res.setHeader('Content-disposition', `inline; filename="${fileName}"`);
    res.setHeader('Content-type', 'application/pdf');
    return fs.createReadStream(filePath).pipe(res);
  }

  const [items] = await pool.query(
    'SELECT dp.*, pr.nombre as producto_nombre FROM DetallePedido dp JOIN Producto pr ON dp.id_producto = pr.id_producto WHERE dp.id_pedido = ?',
    [id_pedido]
  );

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('El pedido no contiene productos registrados');
  }

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-type', 'application/pdf');

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);
  doc.pipe(res);

  try {
    doc.fillColor('#1a5c20').fontSize(22).text('PURE INKA FOODS', 40, 40, { bold: true });
    doc.fillColor('#444').fontSize(9).text('Superalimentos del Perú para el mundo', 40, 65);
    doc.text('Av. Javier Prado Este 2550, San Isidro, Lima', 40, 80);
    doc.text('Email: ventas@pureinka.com | Web: www.pureinka.com', 40, 92);
    
    const tipoComp = order.tipo_comprobante || 'BOLETA';
    doc.rect(350, 35, 200, 80).lineWidth(2).stroke('#1a5c20');
    doc.fillColor('#000').fontSize(14).text('R.U.C. 10490595932', 350, 50, { align: 'center', width: 200, bold: true });
    doc.fillColor('#1a5c20').fontSize(16).text(tipoComp, 350, 70, { align: 'center', width: 200, bold: true });
    doc.fillColor('#000').fontSize(14).text(`N° #${String(order.id_pedido).padStart(8, '0')}`, 350, 90, { align: 'center', width: 200 });

    doc.moveDown(4);

    const clientY = 140;
    doc.rect(40, clientY, 515, 65).fill('#f9f9f9').stroke('#eee');
    doc.fillColor('#1a5c20').fontSize(10).text('DATOS DEL CLIENTE', 50, clientY + 10, { bold: true });
    doc.fillColor('#000').fontSize(9);
    doc.text(`Señor(es): ${order.razon_social || order.cliente_nombre}`, 50, clientY + 25);
    if (order.ruc) doc.text(`R.U.C.: ${order.ruc}`, 50, clientY + 37);
    doc.text(`Email: ${order.cliente_email}`, 50, order.ruc ? clientY + 49 : clientY + 37);
    
    doc.text(`Fecha Emisión: ${new Date(order.fecha).toLocaleDateString()}`, 400, clientY + 25);
    doc.text(`Moneda: SOLES (S/.)`, 400, clientY + 37);
    doc.text(`Pago: ${order.metodo_pago?.toUpperCase() || 'OTROS'}`, 400, clientY + 49);

    const tableTop = 220;
    doc.rect(40, tableTop, 515, 20).fill('#1a5c20');
    doc.fillColor('#fff').fontSize(9).text('DESCRIPCIÓN', 50, tableTop + 6, { bold: true });
    doc.text('CANT.', 300, tableTop + 6, { bold: true, width: 40, align: 'center' });
    doc.text('P. UNIT', 380, tableTop + 6, { bold: true, width: 70, align: 'right' });
    doc.text('TOTAL', 470, tableTop + 6, { bold: true, width: 80, align: 'right' });

    let currentY = tableTop + 25;
    doc.fillColor('#333');

    for (const item of items) {
      if (currentY > 700) { doc.addPage(); currentY = 50; }
      
      const price = Number(item.precio_fijo) || 0;
      const quantity = Number(item.cantidad) || 0;
      const subtotal = price * quantity;

      doc.text(item.producto_nombre, 50, currentY, { width: 240 });
      doc.text(quantity.toString(), 300, currentY, { width: 40, align: 'center' });
      doc.text(`S/. ${price.toFixed(2)}`, 380, currentY, { width: 70, align: 'right' });
      doc.text(`S/. ${subtotal.toFixed(2)}`, 470, currentY, { width: 80, align: 'right' });
      
      doc.moveTo(40, currentY + 15).lineTo(555, currentY + 15).lineWidth(0.5).strokeColor('#eee').stroke();
      currentY += 25;
    }

    if (currentY > 700) { doc.addPage(); currentY = 50; }
    
    const totalsX = 380;
    const orderTotal = Number(order.total) || 0;
    const igv = orderTotal * 0.18;
    const subtotalBase = orderTotal - igv;

    doc.fillColor('#444').fontSize(9);
    doc.text('OP. GRAVADA:', totalsX, currentY + 10, { width: 90, align: 'right' });
    doc.text(`S/. ${subtotalBase.toFixed(2)}`, 480, currentY + 10, { width: 70, align: 'right' });

    doc.text('I.G.V. (18%):', totalsX, currentY + 22, { width: 90, align: 'right' });
    doc.text(`S/. ${igv.toFixed(2)}`, 480, currentY + 22, { width: 70, align: 'right' });

    doc.rect(470, currentY + 35, 85, 20).fill('#1a5c20');
    doc.fillColor('#fff').fontSize(10).text('TOTAL:', totalsX, currentY + 40, { width: 90, align: 'right', bold: true });
    doc.text(`S/. ${orderTotal.toFixed(2)}`, 480, currentY + 40, { width: 70, align: 'right', bold: true });

    doc.fillColor('#888').fontSize(8).text('Representación impresa de un comprobante electrónico.', 40, 760, { align: 'center', width: 515 });
    doc.text('Consulte la validez de este documento en el portal de SUNAT.', 40, 772, { align: 'center', width: 515 });
    doc.text('Pure Inka Foods S.A.C. - RUC: 10490595932 - Lima, Perú', 40, 784, { align: 'center', width: 515 });
    doc.fillColor('#1a5c20').fontSize(10).text('¡GRACIAS POR SU COMPRA!', 40, 800, { align: 'center', width: 515, bold: true });

    doc.end();

    writeStream.on('finish', async () => {
      await pool.query('UPDATE Pedido SET comprobante_pdf_url = ? WHERE id_pedido = ?', [fileUrl, id_pedido]);
    });

  } catch (pdfError) {
    if (!res.headersSent) res.status(500).json({ success: false, message: 'Error al generar el documento PDF' });
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Pedido WHERE id_usuario = ? ORDER BY fecha DESC', [req.user.id_usuario]);
  res.json({ success: true, data: rows });
});

const getOrderById = asyncHandler(async (req, res) => {
  const [orderRows] = await pool.query('SELECT p.*, u.nombre, u.email FROM Pedido p JOIN Usuario u ON p.id_usuario = u.id_usuario WHERE p.id_pedido = ?', [req.params.id]);
  const order = orderRows[0];
  if (order) {
    if (order.id_usuario !== req.user.id_usuario && req.user.rol !== 'ADMIN') {
      res.status(403);
      throw new Error('No autorizado para ver este pedido');
    }
    const [details] = await pool.query('SELECT dp.*, pr.nombre as producto_nombre, pr.sku FROM DetallePedido dp JOIN Producto pr ON dp.id_producto = pr.id_producto WHERE dp.id_pedido = ?', [req.params.id]);
    order.items = details;
    res.json({ success: true, data: order });
  } else {
    res.status(404);
    throw new Error('Pedido no encontrado');
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT p.*, u.nombre, u.email FROM Pedido p JOIN Usuario u ON p.id_usuario = u.id_usuario ORDER BY p.fecha DESC');
  res.json({ success: true, data: rows });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { estado_pago, estado_envio } = req.body;
  const id_pedido = req.params.id;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orderRows] = await connection.query('SELECT * FROM Pedido WHERE id_pedido = ?', [id_pedido]);
    if (orderRows.length === 0) {
      res.status(404);
      throw new Error('Pedido no encontrado');
    }

    const order = orderRows[0];
    const prevEnvio = order.estado_envio;
    let finalEnvio = estado_envio || prevEnvio;

    if (estado_pago === 'RECHAZADO') {
      finalEnvio = 'CANCELADO';
    }

    if (finalEnvio === 'CANCELADO' && prevEnvio !== 'CANCELADO') {
      const [items] = await connection.query('SELECT id_producto, cantidad FROM DetallePedido WHERE id_pedido = ?', [id_pedido]);
      for (const item of items) {
        await connection.query('UPDATE Producto SET stock_actual = stock_actual + ? WHERE id_producto = ?', [item.cantidad, item.id_producto]);
        await connection.query('INSERT INTO MovimientoStock (id_producto, cantidad, tipo, motivo) VALUES (?, ?, ?, ?)', [item.id_producto, item.cantidad, 'ENTRADA', `Cancelación Pedido #${id_pedido}`]);
      }
    }

    const query = 'UPDATE Pedido SET estado_pago = ?, estado_envio = ? WHERE id_pedido = ?';
    const values = [estado_pago || order.estado_pago, finalEnvio, id_pedido];
    await connection.query(query, values);

    await connection.commit();
    res.json({ success: true, message: 'Pedido actualizado correctamente' });
  } catch (error) {
    await connection.rollback();
    res.status(400);
    throw error;
  } finally {
    connection.release();
  }
});

module.exports = { addOrderItems, getMyOrders, getOrderById, getAllOrders, createPaymentIntent, updateOrderStatus, generateOrderPDF };
