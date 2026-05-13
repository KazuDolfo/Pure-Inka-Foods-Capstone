const pool = require('../config/db');
const asyncHandler = require('express-async-handler');

/**
 * @desc    CLIENTE: Obtener o crear su conversación única
 * @route   GET /api/messages/my-conversation
 */
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const userId = req.user.id_usuario;

  // 1. Buscar si ya existe la conversación
  let [conversations] = await pool.query(
    `SELECT c.*, u.nombre as nombre_admin 
     FROM Conversacion c 
     JOIN Usuario u ON c.id_admin = u.id_usuario 
     WHERE c.id_cliente = ?`,
    [userId]
  );

  let conversation;

  if (conversations.length === 0) {
    // 2. Si no existe, buscar un admin para asignar (o default id 1)
    const [admins] = await pool.query("SELECT id_usuario, nombre FROM Usuario WHERE rol = 'ADMIN' LIMIT 1");
    const adminId = admins.length > 0 ? admins[0].id_usuario : 1;
    const adminNombre = admins.length > 0 ? admins[0].nombre : 'Administrador';

    const [result] = await pool.query(
      'INSERT INTO Conversacion (id_cliente, id_admin) VALUES (?, ?)',
      [userId, adminId]
    );
    
    const [newConv] = await pool.query('SELECT * FROM Conversacion WHERE id_conversacion = ?', [result.insertId]);
    conversation = { ...newConv[0], nombre_admin: adminNombre };
  } else {
    conversation = conversations[0];
  }

  // 3. Traer mensajes ordenados por fecha_envio (según esquema)
  const [messages] = await pool.query(
    `SELECT m.*, u.nombre as emisor_nombre 
     FROM Mensaje m
     JOIN Usuario u ON m.id_emisor = u.id_usuario
     WHERE m.id_conversacion = ? 
     ORDER BY m.fecha_envio ASC`,
    [conversation.id_conversacion]
  );

  res.json({
    success: true,
    data: { 
      ...conversation, 
      messages 
    }
  });
});

/**
 * @desc    ENVIAR MENSAJE (Lógica de Persistencia Silenciosa mejorada)
 */
const saveMessage = async (id_conversacion, id_emisor, contenido, tipo_mensaje, url_adjunto) => {
  let finalConvId = id_conversacion;

  // Si no hay id_conversacion (caso especial de cliente iniciando chat por socket/http sin previo GET)
  if (!finalConvId) {
    // Buscamos si el emisor (cliente) ya tiene una conversación
    const [convs] = await pool.query('SELECT id_conversacion FROM Conversacion WHERE id_cliente = ?', [id_emisor]);
    
    if (convs.length === 0) {
      // Crear conversación primero
      const [admins] = await pool.query("SELECT id_usuario FROM Usuario WHERE rol = 'ADMIN' LIMIT 1");
      const adminId = admins.length > 0 ? admins[0].id_usuario : 1;
      
      const [result] = await pool.query(
        'INSERT INTO Conversacion (id_cliente, id_admin) VALUES (?, ?)',
        [id_emisor, adminId]
      );
      finalConvId = result.insertId;
    } else {
      finalConvId = convs[0].id_conversacion;
    }
  }

  // Ahora sí, insertar el mensaje
  const [msgResult] = await pool.query(
    'INSERT INTO Mensaje (id_conversacion, id_emisor, contenido, tipo_mensaje, url_adjunto) VALUES (?, ?, ?, ?, ?)',
    [finalConvId, id_emisor, contenido, tipo_mensaje || 'TEXTO', url_adjunto || null]
  );

  // Actualizar ultima_actualizacion en Conversacion
  await pool.query(
    'UPDATE Conversacion SET ultima_actualizacion = CURRENT_TIMESTAMP WHERE id_conversacion = ?',
    [finalConvId]
  );

  // Obtener el nombre del emisor para el socket
  const [userRows] = await pool.query('SELECT nombre FROM Usuario WHERE id_usuario = ?', [id_emisor]);
  const emisor_nombre = userRows.length > 0 ? userRows[0].nombre : 'Usuario';

  return {
    id_mensaje: msgResult.insertId,
    id_conversacion: finalConvId,
    emisor_nombre
  };
};

/**
 * @desc    ADMIN: Listar todas las conversaciones (Bandeja de Entrada)
 */
const getAdminConversations = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      c.*, 
      u.nombre as nombre_cliente, 
      u.email as email_cliente,
      (SELECT contenido FROM Mensaje WHERE id_conversacion = c.id_conversacion ORDER BY fecha_envio DESC LIMIT 1) as ultimo_mensaje,
      (SELECT COUNT(*) FROM Mensaje WHERE id_conversacion = c.id_conversacion AND leido = FALSE AND id_emisor != ?) as no_leidos
    FROM Conversacion c
    JOIN Usuario u ON c.id_cliente = u.id_usuario
    ORDER BY c.ultima_actualizacion DESC
  `, [req.user.id_usuario]);

  res.json({ success: true, data: rows });
});

/**
 * @desc    ADMIN: Obtener mensajes y marcar como leído
 */
const getConversationMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await pool.query(
    'UPDATE Mensaje SET leido = TRUE WHERE id_conversacion = ? AND id_emisor != ?',
    [id, req.user.id_usuario]
  );

  const [messages] = await pool.query(
    `SELECT m.*, u.nombre as emisor_nombre 
     FROM Mensaje m
     JOIN Usuario u ON m.id_emisor = u.id_usuario
     WHERE m.id_conversacion = ? 
     ORDER BY m.fecha_envio ASC`,
    [id]
  );

  res.json({ success: true, data: messages });
});

module.exports = { 
  getOrCreateConversation, 
  getAdminConversations, 
  getConversationMessages,
  saveMessage 
};
