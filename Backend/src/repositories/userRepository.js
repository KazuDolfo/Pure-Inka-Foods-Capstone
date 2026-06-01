const pool = require('../config/db');

class UserRepository {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM Usuario WHERE email = ?', [email]);
    return rows[0];
  }

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM Usuario WHERE id_usuario = ?',
      [id]
    );
    return rows[0];
  }

  async findByIdentifier(identifier) {
    const [rows] = await pool.query(
      'SELECT id_usuario, email, telefono FROM Usuario WHERE email = ? OR telefono = ?',
      [identifier, identifier]
    );
    return rows[0];
  }

  async existsEmailExcludeUser(email, userId) {
    const [rows] = await pool.query(
      'SELECT id_usuario FROM Usuario WHERE email = ? AND id_usuario != ?',
      [email, userId]
    );
    return rows.length > 0;
  }

  async create(userData) {
    const { nombre, email, hashedPassword, telefono } = userData;
    const [result] = await pool.query(
      'INSERT INTO Usuario (nombre, email, contrasena, telefono) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, telefono]
    );
    return result;
  }

  async updateProfile(userId, profileData) {
    const { nombre, email, telefono } = profileData;
    const [result] = await pool.query(
      'UPDATE Usuario SET nombre = ?, email = ?, telefono = ? WHERE id_usuario = ?',
      [nombre, email, telefono, userId]
    );
    return result;
  }

  async updatePassword(userId, hashedPassword) {
    const [result] = await pool.query(
      'UPDATE Usuario SET contrasena = ? WHERE id_usuario = ?',
      [hashedPassword, userId]
    );
    return result;
  }

  async setRecoveryCode(userId, code, expiration) {
    const [result] = await pool.query(
      'UPDATE Usuario SET codigo_recuperacion = ?, codigo_expiracion = ? WHERE id_usuario = ?',
      [code, expiration, userId]
    );
    return result;
  }

  async findByRecoveryCode(identifier, code) {
    const [rows] = await pool.query(
      'SELECT id_usuario FROM Usuario WHERE (email = ? OR telefono = ?) AND codigo_recuperacion = ? AND codigo_expiracion > NOW()',
      [identifier, identifier, code]
    );
    return rows[0];
  }

  async findAll() {
    const [rows] = await pool.query('SELECT id_usuario, nombre, email, telefono, rol, fecha_registro, activo FROM Usuario ORDER BY fecha_registro DESC');
    return rows;
  }

  async toggleActive(userId, active) {
    const [result] = await pool.query(
      'UPDATE Usuario SET activo = ? WHERE id_usuario = ?',
      [active, userId]
    );
    return result;
  }

  async updateRole(userId, role) {
    const [result] = await pool.query(
      'UPDATE Usuario SET rol = ? WHERE id_usuario = ?',
      [role, userId]
    );
    return result;
  }
}

module.exports = new UserRepository();
