const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { saveMessage } = require('./src/controllers/messageController'); // Importar función mejorada
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4200", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) return next(new Error("No autorizado"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; 
    next();
  } catch (err) {
    next(new Error("Token inválido"));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 [SOCKET] Conectado: ${socket.user.id}`);

  if (socket.user.rol === 'ADMIN') {
    socket.join('admin_notifications');
  }

  socket.on('join_room', (id_conversacion) => {
    socket.join(`chat_${id_conversacion}`);
  });

  socket.on('send_message', async (data) => {
    const { id_conversacion, contenido, tipo_mensaje, url_adjunto } = data;
    
    try {
      // Usar la función mejorada que maneja la creación de conversaciones
      const result = await saveMessage(
        id_conversacion, 
        socket.user.id, 
        contenido, 
        tipo_mensaje, 
        url_adjunto
      );

      const messageData = {
        id_mensaje: result.id_mensaje,
        id_emisor: socket.user.id,
        emisor_nombre: result.emisor_nombre,
        id_conversacion: result.id_conversacion,
        contenido,
        tipo_mensaje: tipo_mensaje || 'TEXTO',
        url_adjunto: url_adjunto || null,
        fecha_envio: new Date()
      };

      // Emitir a la sala del chat
      io.to(`chat_${result.id_conversacion}`).emit('receive_message', messageData);

      // Notificar a los admins si es un cliente
      if (socket.user.rol === 'CLIENTE') {
        io.to('admin_notifications').emit('new_client_message', messageData);
      }
      
    } catch (error) {
      console.error('❌ [SOCKET_ERROR]:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ [SOCKET] Desconectado: ${socket.user.id}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor PureInka en puerto ${PORT}`);
});
