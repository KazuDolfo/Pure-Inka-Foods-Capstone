const pool = require('../config/db');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Obtener lista de países
 * @route   GET /api/addresses/countries
 * @access  Public
 */
const getCountries = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Pais ORDER BY nombre ASC');
  res.json({
    success: true,
    data: rows,
  });
});

/**
 * @desc    Obtener mis direcciones
 * @route   GET /api/addresses
 * @access  Private
 */
const getMyAddresses = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT d.*, p.nombre as pais_nombre FROM Direccion d JOIN Pais p ON d.id_pais = p.id_pais WHERE d.id_usuario = ?',
    [req.user.id_usuario]
  );
  res.json({
    success: true,
    data: rows,
  });
});

/**
 * @desc    Agregar una nueva dirección
 * @route   POST /api/addresses
 * @access  Private
 */
const addAddress = asyncHandler(async (req, res) => {
  const { 
    id_pais, 
    nombre_direccion, 
    estado_region, 
    ciudad, 
    codigo_postal, 
    direccion_exacta, 
    referencia 
  } = req.body;

  const [result] = await pool.query(
    'INSERT INTO Direccion (id_usuario, id_pais, nombre_direccion, estado_region, ciudad, codigo_postal, direccion_exacta, referencia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user.id_usuario, id_pais, nombre_direccion, estado_region, ciudad, codigo_postal, direccion_exacta, referencia]
  );

  if (result.affectedRows > 0) {
    res.status(201).json({
      success: true,
      data: {
        id_direccion: result.insertId,
        ...req.body
      },
    });
  } else {
    res.status(400);
    throw new Error('Datos de dirección inválidos');
  }
});

module.exports = {
  getCountries,
  getMyAddresses,
  addAddress,
};
