const jwt = require('jsonwebtoken');

module.exports = (io) => {

  // ── Autenticación en Socket.io ─────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, name, email, role }
      next();
    } catch (err) {
      next(new Error('Token inválido'));
    }
  });

  // ── Eventos de conexión ────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`"luz verde" Socket conectado: ${socket.user.name} (${socket.user.role})`);

    // Unirse a la sala de un ticket
    // El cliente emite: socket.emit('join_ticket', ticketId)
    socket.on('join_ticket', (ticketId) => {
      socket.join(`ticket_${ticketId}`);
      console.log(`👤 ${socket.user.name} se unió al ticket #${ticketId}`);
    });

    // Salir de la sala de un ticket
    socket.on('leave_ticket', (ticketId) => {
      socket.leave(`ticket_${ticketId}`);
      console.log(`👤 ${socket.user.name} salió del ticket #${ticketId}`);
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`"luz roja" Socket desconectado: ${socket.user.name}`);
    });
  });

};
