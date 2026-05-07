const TicketModel = require('../models/ticketModel');

const ticketController = {

  // ── POST /api/tickets ────────────────────────────────────
  // Crear ticket (usuario)
  async create(req, res) {
    try {
      const { category_id, title, description, priority } = req.body;
      const user_id = req.user.id;

      if (!category_id || !title || !description || !priority) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }

      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ message: 'Prioridad inválida. Usar: low, medium, high' });
      }

      const ticketId = await TicketModel.create({
        user_id, category_id, title, description, priority
      });

      res.status(201).json({
        message: 'Ticket creado correctamente',
        ticketId,
      });

    } catch (err) {
      console.error('Error en create ticket:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // ── GET /api/tickets ─────────────────────────────────────
  // Listar tickets del usuario logueado
  async getMyTickets(req, res) {
    try {
      const tickets = await TicketModel.findByUser(req.user.id);
      res.json({ tickets });
    } catch (err) {
      console.error('Error en getMyTickets:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // ── GET /api/tickets/all ─────────────────────────────────
  // Listar todos los tickets (soporte)
  async getAll(req, res) {
    try {
      const { status } = req.query;
      const tickets = await TicketModel.findAll({ status });
      res.json({ tickets });
    } catch (err) {
      console.error('Error en getAll tickets:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // ── GET /api/tickets/:id ──────────────────────────────────
  // Obtener un ticket por id
  async getById(req, res) {
    try {
      const ticket = await TicketModel.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
      }

      // Usuario solo puede ver sus propios tickets
      if (req.user.role === 'user' && ticket.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }

      res.json({ ticket });

    } catch (err) {
      console.error('Error en getById ticket:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // ── PATCH /api/tickets/:id ───────────────────────────────
  // Actualizar ticket (soporte)
  async update(req, res) {
    try {
      const { status, priority, assigned_to } = req.body;
      const id = req.params.id;

      const ticket = await TicketModel.findById(id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
      }

      const validStatuses   = ['pending', 'in_progress', 'resolved', 'closed'];
      const validPriorities = ['low', 'medium', 'high'];

      if (status   && !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Estado inválido' });
      }
      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({ message: 'Prioridad inválida' });
      }

      await TicketModel.update(id, { status, priority, assigned_to });

      res.json({ message: 'Ticket actualizado correctamente' });

    } catch (err) {
      console.error('Error en update ticket:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // ── GET /api/tickets/categories ──────────────────────────
  // Obtener categorías
  async getCategories(req, res) {
    try {
      const categories = await TicketModel.getCategories();
      res.json({ categories });
    } catch (err) {
      console.error('Error en getCategories:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
async delete(req, res) {
  try {
    const ticket = await TicketModel.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });
    if (ticket.user_id !== req.user.id) return res.status(403).json({ message: 'Acceso denegado' });
    if (ticket.status !== 'closed') return res.status(400).json({ message: 'Solo podés eliminar tickets cerrados' });
    await TicketModel.delete(req.params.id);
    res.json({ message: 'Ticket eliminado correctamente' });
  } catch (err) {
    console.error('Error en delete ticket:', err.message);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
},
};

module.exports = ticketController;
