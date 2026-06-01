const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Activar SSL si no es localhost (necesario para Aiven y otros servicios cloud)
if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
  dbConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = mysql.createPool(dbConfig);

pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully to', process.env.DB_NAME);
    connection.release();
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
  });

module.exports = pool;
