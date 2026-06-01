const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/addressRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cartRoutes = require('./routes/cartRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

app.disable('x-powered-by'); 

app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['*'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como herramientas de servidor o apps móviles)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, '../public'), {
  index: false,
  cacheControl: true,
  maxAge: '1d'
}));

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

app.use(notFound);
app.use(errorHandler);

module.exports = app;
