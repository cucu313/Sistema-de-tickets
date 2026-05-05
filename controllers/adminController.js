const UserModel = require('../models/userModel');

const adminController = {

  // GET /api/admin/pending — listar empleados pendientes
  async getPending(req, res) {
    try {
      const users = await UserModel.findPending();
      res.json({ users });
    } catch (err) {
      console.error('Error en getPending:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // GET /api/admin/support — listar empleados aprobados
  async getSupport(req, res) {
    try {
      const users = await UserModel.findSupport();
      res.json({ users });
    } catch (err) {
      console.error('Error en getSupport:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // PATCH /api/admin/approve/:id — aprobar empleado
  async approve(req, res) {
    try {
      const { id } = req.params;
      await UserModel.updateRole(id, 'support');
      res.json({ message: 'Empleado aprobado como soporte técnico' });
    } catch (err) {
      console.error('Error en approve:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // PATCH /api/admin/reject/:id — rechazar empleado (queda como user)
  async reject(req, res) {
    try {
      const { id } = req.params;
      await UserModel.updateRole(id, 'user');
      res.json({ message: 'Solicitud rechazada. El usuario quedó como cliente.' });
    } catch (err) {
      console.error('Error en reject:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

};

module.exports = adminController;
