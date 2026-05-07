const UserModel = require('../models/userModel');

const adminController = {

  async getPending(req, res) {
    try {
      const users = await UserModel.findPending();
      res.json({ users });
    } catch (err) {
      console.error('Error en getPending:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getSupport(req, res) {
    try {
      const users = await UserModel.findSupport();
      res.json({ users });
    } catch (err) {
      console.error('Error en getSupport:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getSuspended(req, res) {
    try {
      const users = await UserModel.findSuspended();
      res.json({ users });
    } catch (err) {
      console.error('Error en getSuspended:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async approve(req, res) {
    try {
      await UserModel.updateRole(req.params.id, 'support');
      res.json({ message: 'Empleado aprobado como soporte técnico' });
    } catch (err) {
      console.error('Error en approve:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async reject(req, res) {
    try {
      await UserModel.updateRole(req.params.id, 'user');
      res.json({ message: 'Solicitud rechazada. El usuario quedó como cliente.' });
    } catch (err) {
      console.error('Error en reject:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async changeRole(req, res) {
    try {
      const { role } = req.body;
      const validRoles = ['user', 'support', 'suspended', 'pending'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rol inválido' });
      }
      await UserModel.updateRole(req.params.id, role);
      res.json({ message: 'Rol actualizado correctamente' });
    } catch (err) {
      console.error('Error en changeRole:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

};

module.exports = adminController;
