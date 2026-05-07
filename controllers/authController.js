const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const authController = {

  // POST /api/auth/register (cliente)
  async register(req, res) {
    try {
      const { name, apellido, dni, email, password, confirmPassword } = req.body;
      if (!name || !apellido || !dni || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden' });
      }
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) return res.status(409).json({ message: 'El email ya está registrado' });
      const existingDni = await UserModel.findByDni(dni);
      if (existingDni) return res.status(409).json({ message: 'El DNI ya está registrado' });
      const password_hash = await bcrypt.hash(password, 10);
      const userId = await UserModel.create({ name, apellido, dni, email, password_hash, role: 'user' });
      res.status(201).json({ message: 'Usuario registrado correctamente', userId });
    } catch (err) {
      console.error('Error en register:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // POST /api/auth/register-soporte
  async registerSoporte(req, res) {
    try {
      const { name, apellido, dni, email, password, confirmPassword } = req.body;
      if (!name || !apellido || !dni || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden' });
      }
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) return res.status(409).json({ message: 'El email ya está registrado' });
      const existingDni = await UserModel.findByDni(dni);
      if (existingDni) return res.status(409).json({ message: 'El DNI ya está registrado' });
      const password_hash = await bcrypt.hash(password, 10);
      const userId = await UserModel.create({ name, apellido, dni, email, password_hash, role: 'pending' });
      res.status(201).json({ message: 'Solicitud enviada. Esperá la aprobación del administrador.', userId });
    } catch (err) {
      console.error('Error en registerSoporte:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // POST /api/auth/login
  async login(req, res) {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ message: 'Email/DNI y contraseña son requeridos' });
      }
      const user = await UserModel.findByEmailOrDni(identifier);
      if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });
      if (user.role === 'pending') {
        return res.status(403).json({ message: 'Tu solicitud está pendiente de aprobación por el administrador.' });
      }
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });
      const token = jwt.sign(
        { id: user.id, name: user.name, apellido: user.apellido, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );
      res.json({
        message: 'Login exitoso',
        token,
        user: { id: user.id, name: user.name, apellido: user.apellido, dni: user.dni, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error('Error en login:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // GET /api/auth/me
  async me(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
      res.json({ user });
    } catch (err) {
      console.error('Error en me:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // PATCH /api/auth/update
  async update(req, res) {
    try {
      const { name, apellido, telefono, domicilio } = req.body;
      if (!name || !apellido) {
        return res.status(400).json({ message: 'Nombre y apellido son requeridos' });
      }
      await UserModel.updateProfile(req.user.id, { name, apellido, telefono, domicilio });
      res.json({ message: 'Datos actualizados correctamente' });
    } catch (err) {
      console.error('Error en update:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

};

module.exports = authController;