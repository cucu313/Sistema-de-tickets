const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const authController = {

  // ── POST /api/auth/register ──────────────────────────────
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Validaciones básicas
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      }

      // Verificar si el email ya existe
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'El email ya está registrado' });
      }

      // Hashear contraseña
      const password_hash = await bcrypt.hash(password, 10);

      // Crear usuario (solo se permite role 'user' desde registro público)
      const userId = await UserModel.create({
        name,
        email,
        password_hash,
        role: role === 'support' ? 'support' : 'user',
      });

      res.status(201).json({
        message: 'Usuario registrado correctamente',
        userId,
      });

    } catch (err) {
      console.error('Error en register:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // ── POST /api/auth/login ─────────────────────────────────
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
      }

      // Buscar usuario
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
      }

      // Verificar contraseña
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
      }

      // Generar token JWT
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  user.role,
        },
      });

    } catch (err) {
      console.error('Error en login:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // ── GET /api/auth/me ─────────────────────────────────────
  async me(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json({ user });
    } catch (err) {
      console.error('Error en me:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

};

module.exports = authController;
