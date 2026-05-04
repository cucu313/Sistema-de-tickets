const db = require('../db');

const TicketModel = {

  // Crear ticket
  async create({ user_id, category_id, title, description, priority }) {
    const [result] = await db.query(
      `INSERT INTO tickets (user_id, category_id, title, description, priority)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, category_id, title, description, priority]
    );
    return result.insertId;
  },

  // Obtener todos los tickets de un usuario
  async findByUser(user_id) {
    const [rows] = await db.query(
      `SELECT
         t.id, t.title, t.description, t.priority, t.status,
         t.created_at, t.updated_at,
         c.name AS category_name,
         u.name AS assigned_to_name
       FROM tickets t
       JOIN categories c ON t.category_id = c.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [user_id]
    );
    return rows;
  },

  // Obtener todos los tickets (panel soporte)
  async findAll({ status } = {}) {
    let query = `
      SELECT
        t.id, t.title, t.priority, t.status,
        t.created_at, t.updated_at,
        c.name  AS category_name,
        u.name  AS client_name,
        u.email AS client_email,
        s.name  AS assigned_to_name
      FROM tickets t
      JOIN categories c ON t.category_id = c.id
      JOIN users u      ON t.user_id     = u.id
      LEFT JOIN users s ON t.assigned_to = s.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE t.status = ?';
      params.push(status);
    }

    query += ` ORDER BY
      FIELD(t.priority, 'high', 'medium', 'low'),
      t.created_at ASC`;

    const [rows] = await db.query(query, params);
    return rows;
  },

  // Obtener un ticket por id
  async findById(id) {
    const [rows] = await db.query(
      `SELECT
         t.*,
         c.name  AS category_name,
         u.name  AS client_name,
         u.email AS client_email,
         s.name  AS assigned_to_name
       FROM tickets t
       JOIN categories c ON t.category_id = c.id
       JOIN users u      ON t.user_id     = u.id
       LEFT JOIN users s ON t.assigned_to = s.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // Actualizar estado y/o prioridad (soporte)
  async update(id, { status, priority, assigned_to }) {
    const fields = [];
    const params = [];

    if (status)      { fields.push('status = ?');      params.push(status); }
    if (priority)    { fields.push('priority = ?');    params.push(priority); }
    if (assigned_to) { fields.push('assigned_to = ?'); params.push(assigned_to); }

    if (fields.length === 0) return false;

    params.push(id);
    await db.query(
      `UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return true;
  },

  // Obtener todas las categorías
  async getCategories() {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
    return rows;
  },

};

module.exports = TicketModel;
