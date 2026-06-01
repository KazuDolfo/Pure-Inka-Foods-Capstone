const pool = require('../config/db');

class CartRepository {
  async findByUserId(userId) {
    const [rows] = await pool.query('SELECT id_carrito FROM Carrito WHERE id_usuario = ?', [userId]);
    return rows[0];
  }

  async create(userId) {
    const [result] = await pool.query('INSERT INTO Carrito (id_usuario) VALUES (?)', [userId]);
    return result;
  }

  async getOrCreateCart(userId) {
    let cart = await this.findByUserId(userId);
    if (!cart) {
      const result = await this.create(userId);
      return result.insertId;
    }
    return cart.id_carrito;
  }

  async getItems(userId) {
    const [items] = await pool.query(
      `SELECT ci.id_carrito_item, ci.id_producto, ci.cantidad, p.nombre, p.precio, p.imagen_url, p.stock_actual 
       FROM Carrito c
       JOIN CarritoItem ci ON c.id_carrito = ci.id_carrito
       JOIN Producto p ON ci.id_producto = p.id_producto
       WHERE c.id_usuario = ?`,
      [userId]
    );
    return items;
  }

  async addItem(cartId, productId, quantity) {
    const [result] = await pool.query(
      `INSERT INTO CarritoItem (id_carrito, id_producto, cantidad) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)`,
      [cartId, productId, quantity]
    );
    return result;
  }

  async removeItem(userId, productId) {
    const [result] = await pool.query(
      `DELETE ci FROM CarritoItem ci
       JOIN Carrito c ON ci.id_carrito = c.id_carrito
       WHERE c.id_usuario = ? AND ci.id_producto = ?`,
      [userId, productId]
    );
    return result;
  }

  async clear(userId) {
    const [result] = await pool.query(
      `DELETE ci FROM CarritoItem ci
       JOIN Carrito c ON ci.id_carrito = c.id_carrito
       WHERE c.id_usuario = ?`,
      [userId]
    );
    return result;
  }
}

module.exports = new CartRepository();
