const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Rutas
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/addressRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cartRoutes = require('./routes/cartRoutes');
const statsRoutes = require('./routes/statsRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// --- SEGURIDAD Y CONFIGURACIÓN ---
app.disable('x-powered-by'); // Seguridad: No revelar tecnologías

app.use(helmet({
  crossOriginResourcePolicy: false, // Permitir que el frontend acceda a imágenes
  contentSecurityPolicy: false,      // Desactivado en dev para evitar conflictos de recursos externos
}));

app.use(cors()); // Permitir peticiones desde cualquier origen (ajustar en prod)
app.use(morgan('dev')); // Logs de peticiones en consola
app.use(express.json()); // Parseo de JSON con límite (buena práctica)
app.use(express.urlencoded({ extended: true }));

// --- RUTAS ESTÁTICAS ---
// Solo servimos la carpeta de uploads. Sin auto-index para evitar que listen tus archivos.
app.use('/public', express.static(path.join(__dirname, '../public'), {
  index: false,
  cacheControl: true,
  maxAge: '1d'
}));

// --- ENDPOINTS DE LA API ---
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de Pure Inka Foods',
    status: 'running',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => res.status(200).json({ status: 'up', timestamp: new Date() }));

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/stats', statsRoutes);

// --- MANEJO DE ERRORES ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
