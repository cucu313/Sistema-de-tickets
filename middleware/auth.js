const jwt = require('jsonwebtoken');

// ── Verificar token JWT ────────────────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// ── Solo agentes de soporte ────────────────────────────────
const onlySupport = (req, res, next) => {
  if (req.user.role !== 'support') {
    return res.status(403).json({ message: 'Acceso denegado: solo soporte técnico' });
  }
  next();
};

// ── Solo usuarios normales ─────────────────────────────────
const onlyUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Acceso denegado: solo usuarios' });
  }
  next();
};
const onlyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: solo administradores' });
  }
  next();
};
module.exports = { verifyToken, onlySupport, onlyUser, onlyAdmin }