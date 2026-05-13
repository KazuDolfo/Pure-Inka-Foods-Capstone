const express = require('express');
const router = express.Router();
const { 
  getOrCreateConversation, 
  getAdminConversations, 
  getConversationMessages,
  saveMessage // Para usar en POST si prefieres HTTP sobre Sockets para el envío
} = require('../controllers/messageController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const asyncHandler = require('express-async-handler');

router.use(protect); // Todas las rutas requieren autenticación

// --- CLIENTE ---
router.get('/my-conversation', getOrCreateConversation);

// --- ADMINISTRADOR (Bandeja de Entrada) ---
router.get('/admin/conversations', authorize('ADMIN'), getAdminConversations);
router.get('/admin/conversations/:id', authorize('ADMIN'), getConversationMessages);

// --- ENVÍO DE MENSAJES (Fallback HTTP) ---
router.post('/', asyncHandler(async (req, res) => {
  const { id_conversacion, contenido, tipo_mensaje, url_adjunto } = req.body;
  const id_emisor = req.user.id_usuario;

  // Si un cliente envía mensaje sin ID, buscamos su conversación primero (o la creamos)
  let finalConvId = id_conversacion;
  if (req.user.rol === 'CLIENTE' && !finalConvId) {
    // Reutilizar lógica del controlador si es necesario o manejar aquí
  }

  const id_mensaje = await saveMessage(finalConvId, id_emisor, contenido, tipo_mensaje, url_adjunto);

  res.status(201).json({
    success: true,
    data: { id_mensaje, id_conversacion: finalConvId, id_emisor, contenido, fecha_envio: new Date() }
  });
}));

module.exports = router;
