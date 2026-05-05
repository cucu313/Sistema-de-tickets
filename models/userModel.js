const db = require('../db');

const UserModel = {

  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findByDni(dni) {
    const [rows] = await db.query('SELECT * FROM users WHERE dni = ?', [dni]);
    return rows[0] || null;
  },

  async findByEmailOrDni(identifier) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? OR dni = ?',
      [identifier, identifier]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, apellido, dni, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, apellido, dni, email, password_hash, role = 'user' }) {
    const [result] = await db.query(
      'INSERT INTO users (name, apellido, dni, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      [name, apellido, dni, email, password_hash, role]
    );
    return result.insertId;
  },

  // Listar todos los usuarios con rol pending
  async findPending() {
    const [rows] = await db.query(
      `SELECT id, name, apellido, dni, email, created_at
       FROM users WHERE role = 'pending'
       ORDER BY created_at DESC`
    );
    return rows;
  },

  // Cambiar rol de un usuario
  async updateRole(id, role) {
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  },

  // Listar todos los usuarios de soporte
  async findSupport() {
    const [rows] = await db.query(
      `SELECT id, name, apellido, dni, email, created_at
       FROM users WHERE role = 'support'
       ORDER BY name ASC`
    );
    return rows;
  },

};

module.exports = UserModel;
