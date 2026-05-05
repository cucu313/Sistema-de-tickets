require('dotenv').config();

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const path       = require('path');

// ── Rutas ──────────────────────────────────────────────────
const authRoutes    = require('./routes/auth');
const ticketRoutes  = require('./routes/tickets');
const messageRoutes = require('./routes/messages');
const adminRoutes   = require('./routes/admin');

// ── Socket service ─────────────────────────────────────────
const initSocket = require('./services/socketService');

// ── App ────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*' }
});

// ── Middlewares globales ───────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Archivos estáticos (frontend) ─────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/tickets',  ticketRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin',    adminRoutes);

// ── Ruta raíz ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// ── Error handler global ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('X Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor'
  });
});

// ── Socket.io ─────────────────────────────────────────────
initSocket(io);

// Hacer io accesible desde los controllers
app.set('io', io);

// ── Iniciar servidor ──────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`"EXITOS" Servidor corriendo en http://localhost:${PORT}`);
});
