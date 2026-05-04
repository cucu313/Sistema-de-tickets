const MessageModel = require('../models/messageModel');
const TicketModel  = require('../models/ticketModel');

const messageController = {

  // ── GET /api/messages/:ticketId ──────────────────────────
  // Obtener mensajes de un ticket
  async getByTicket(req, res) {
    try {
      const { ticketId } = req.params;

      // Verificar que el ticket existe
      const ticket = await TicketModel.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
      }

      // Usuario solo puede ver mensajes de sus propios tickets
      if (req.user.role === 'user' && ticket.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }

      const messages = await MessageModel.findByTicket(ticketId);
      res.json({ messages });

    } catch (err) {
      console.error('Error en getByTicket:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // ── POST /api/messages/:ticketId ─────────────────────────
  // Enviar mensaje en un ticket
  async create(req, res) {
    try {
      const { ticketId } = req.params;
      const { content }  = req.body;
      const user_id      = req.user.id;

      if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'El mensaje no puede estar vacío' });
      }

      // Verificar que el ticket existe
      const ticket = await TicketModel.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
      }

      // Usuario solo puede escribir en sus propios tickets
      if (req.user.role === 'user' && ticket.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }

      // No se puede escribir en tickets cerrados
      if (ticket.status === 'closed') {
        return res.status(400).json({ message: 'No se puede escribir en un ticket cerrado' });
      }

      const messageId = await MessageModel.create({
        ticket_id: ticketId,
        user_id,
        content: content.trim(),
      });

      const newMessage = {
        id:        messageId,
        content:   content.trim(),
        created_at: new Date(),
        user_id,
        user_name: req.user.name,
        user_role: req.user.role,
      };

      // Emitir mensaje por Socket.io (si io está disponible)
      const io = req.app.get('io');
      if (io) {
        io.to(`ticket_${ticketId}`).emit('new_message', newMessage);
      }

      res.status(201).json({ message: 'Mensaje enviado', data: newMessage });

    } catch (err) {
      console.error('Error en create message:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

};

module.exports = messageController;
