const db = require('../db');

const MessageModel = {

  // Crear mensaje
  async create({ ticket_id, user_id, content }) {
    const [result] = await db.query(
      `INSERT INTO messages (ticket_id, user_id, content)
       VALUES (?, ?, ?)`,
      [ticket_id, user_id, content]
    );
    return result.insertId;
  },

  // Obtener todos los mensajes de un ticket
  async findByTicket(ticket_id) {
    const [rows] = await db.query(
      `SELECT
         m.id, m.content, m.created_at,
         u.id   AS user_id,
         u.name AS user_name,
         u.role AS user_role
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.ticket_id = ?
       ORDER BY m.created_at ASC`,
      [ticket_id]
    );
    return rows;
  },

};

module.exports = MessageModel;
