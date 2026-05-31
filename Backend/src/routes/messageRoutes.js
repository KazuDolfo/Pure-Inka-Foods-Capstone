const express = require('express');
const router = express.Router();
const { 
  getOrCreateConversation, 
  getAdminConversations, 
  getConversationMessages,
  saveMessage
} = require('../controllers/messageController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const asyncHandler = require('express-async-handler');

router.use(protect);

router.get('/my-conversation', getOrCreateConversation);

router.get('/admin/conversations', authorize('ADMIN'), getAdminConversations);
router.get('/admin/conversations/:id', authorize('ADMIN'), getConversationMessages);

router.post('/', asyncHandler(async (req, res) => {
  const { id_conversacion, contenido, tipo_mensaje, url_adjunto } = req.body;
  const id_emisor = req.user.id_usuario;

  let finalConvId = id_conversacion;

  const id_mensaje = await saveMessage(finalConvId, id_emisor, contenido, tipo_mensaje, url_adjunto);

  res.status(201).json({
    success: true,
    data: { id_mensaje, id_conversacion: finalConvId, id_emisor, contenido, fecha_envio: new Date() }
  });
}));

module.exports = router;
