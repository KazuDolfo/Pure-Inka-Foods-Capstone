const pool = require('../config/db');

class ProductRepository {
  async findAll({ search, category }) {
    let query = `
      SELECT p.*, c.nombre as category_name 
      FROM Producto p
      LEFT JOIN Categoria c ON p.id_categoria = c.id_categoria
      WHERE p.activo = TRUE
    `;
    const params = [];

    if (search) {
      query += ' AND (p.nombre LIKE ? OR p.sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND p.id_categoria = ?';
      params.push(category);
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM Producto WHERE id_producto = ?', [id]);
    return rows[0];
  }

  async create(productData) {
    const { sku, nombre, precio, stock_actual, imagen_url, descripcion, id_categoria } = productData;
    const [result] = await pool.query(
      'INSERT INTO Producto (sku, nombre, precio, stock_actual, imagen_url, descripcion, id_categoria) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sku, nombre, precio, stock_actual, imagen_url, descripcion || '', id_categoria]
    );
    return result;
  }

  async update(id, productData, connection = pool) {
    let query = 'UPDATE Producto SET ';
    const params = [];
    
    for (const [key, value] of Object.entries(productData)) {
      if (value !== undefined) {
        query += `${key} = ?, `;
        params.push(value);
      }
    }

    if (params.length === 0) return null;

    query = query.slice(0, -2);
    query += ' WHERE id_producto = ?';
    params.push(id);

    const [result] = await connection.query(query, params);
    return result;
  }

  async delete(id) {
    const [result] = await pool.query('UPDATE Producto SET activo = FALSE WHERE id_producto = ?', [id]);
    return result;
  }

  async updateStock(id, newStock, connection = pool) {
    const [result] = await connection.query(
      'UPDATE Producto SET stock_actual = ? WHERE id_producto = ?',
      [newStock, id]
    );
    return result;
  }

  async createStockMovement(movementData, connection = pool) {
    const { id_producto, cantidad, tipo, motivo } = movementData;
    const [result] = await connection.query(
      'INSERT INTO MovimientoStock (id_producto, cantidad, tipo, motivo) VALUES (?, ?, ?, ?)',
      [id_producto, cantidad, tipo, motivo]
    );
    return result;
  }

  async getStock(id, connection = pool) {
    const [rows] = await connection.query('SELECT stock_actual FROM Producto WHERE id_producto = ?', [id]);
    return rows[0] ? rows[0].stock_actual : null;
  }
}

module.exports = new ProductRepository();
