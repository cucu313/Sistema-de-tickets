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
    'SELECT id, name, apellido, dni, email, telefono, domicilio, role, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
},

  async create({ name, apellido, dni, email, password_hash, role = 'user', security_question = null, security_answer = null }) {
  const [result] = await db.query(
    'INSERT INTO users (name, apellido, dni, email, password_hash, role, security_question, security_answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, apellido, dni, email, password_hash, role, security_question, security_answer]
  );
  return result.insertId;

  },

  async findPending() {
    const [rows] = await db.query(
      `SELECT id, name, apellido, dni, email, created_at
       FROM users WHERE role = 'pending'
       ORDER BY created_at DESC`
    );
    return rows;
  },

  async updateRole(id, role) {
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  },

  async findSupport() {
    const [rows] = await db.query(
      `SELECT id, name, apellido, dni, email, created_at
       FROM users WHERE role = 'support'
       ORDER BY name ASC`
    );
    return rows;
  },

  async findSuspended() {
    const [rows] = await db.query(
      `SELECT id, name, apellido, dni, email, created_at
       FROM users WHERE role = 'suspended'
       ORDER BY name ASC`
    );
    return rows;
  },

  async updateProfile(id, { name, apellido, telefono, domicilio }) {
    await db.query(
      'UPDATE users SET name=?, apellido=?, telefono=?, domicilio=? WHERE id=?',
      [name, apellido, telefono, domicilio, id]
    );
  },

  // Listar todos los clientes activos
async findClients() {
  const [rows] = await db.query(
    `SELECT id, name, apellido, dni, email, telefono, domicilio, created_at
     FROM users WHERE role = 'user'
     ORDER BY name ASC`
  );
  return rows;
},

// Listar clientes dados de baja
async findBanned() {
  const [rows] = await db.query(
    `SELECT id, name, apellido, dni, email, telefono, domicilio, created_at
     FROM users WHERE role = 'banned'
     ORDER BY name ASC`
  );
  return rows;
},

// Eliminar usuario permanentemente
async deleteUser(id) {
  await db.query('DELETE FROM users WHERE id = ?', [id]);
},
async updatePassword(id, password_hash) {
  await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]);
},

async findByDniAndEmail(dni, email) {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE dni = ? AND email = ?',
    [dni, email]
  );
  return rows[0] || null;
},
};

module.exports = UserModel;