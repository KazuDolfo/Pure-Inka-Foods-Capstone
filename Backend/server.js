const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { saveMessage } = require('./src/controllers/messageController');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
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
  if (socket.user.rol === 'ADMIN') {
    socket.join('admin_notifications');
  }

  socket.on('join_room', (id_conversacion) => {
    socket.join(`chat_${id_conversacion}`);
  });

  socket.on('send_message', async (data) => {
    const { id_conversacion, contenido, tipo_mensaje, url_adjunto } = data;
    
    try {
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

      io.to(`chat_${result.id_conversacion}`).emit('receive_message', messageData);

      if (socket.user.rol === 'CLIENTE') {
        io.to('admin_notifications').emit('new_client_message', messageData);
      }
      
    } catch (error) {
      console.error('Socket error:', error.message);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
