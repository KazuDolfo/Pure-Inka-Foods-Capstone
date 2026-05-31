const pool = require('../config/db');
const asyncHandler = require('express-async-handler');

const getCategories = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Categoria');
  res.json({
    success: true,
    data: rows,
  });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Categoria WHERE id_categoria = ?', [req.params.id]);
  const category = rows[0];

  if (category) {
    res.json({
      success: true,
      data: category,
    });
  } else {
    res.status(404);
    throw new Error('Categoría no encontrada');
  }
});

const createCategory = asyncHandler(async (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    res.status(400);
    throw new Error('El nombre de la categoría es requerido');
  }

  const [result] = await pool.query('INSERT INTO Categoria (nombre) VALUES (?)', [nombre]);

  if (result.affectedRows > 0) {
    res.status(201).json({
      success: true,
      data: {
        id_categoria: result.insertId,
        nombre,
      },
    });
  } else {
    res.status(400);
    throw new Error('Error al crear la categoría');
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { nombre } = req.body;
  const id_categoria = req.params.id;

  const [result] = await pool.query('UPDATE Categoria SET nombre = ? WHERE id_categoria = ?', [nombre, id_categoria]);

  if (result.affectedRows > 0) {
    res.json({
      success: true,
      message: 'Categoría actualizada correctamente',
      data: { id_categoria, nombre },
    });
  } else {
    res.status(404);
    throw new Error('Categoría no encontrada');
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const id_categoria = req.params.id;

  const [result] = await pool.query('DELETE FROM Categoria WHERE id_categoria = ?', [id_categoria]);

  if (result.affectedRows > 0) {
    res.json({
      success: true,
      message: 'Categoría eliminada correctamente',
    });
  } else {
    res.status(404);
    throw new Error('Categoría no encontrada');
  }
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
