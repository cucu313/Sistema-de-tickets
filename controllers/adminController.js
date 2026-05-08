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
      const validRoles = ['user', 'support', 'suspended', 'pending', 'banned'];
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

  async getClients(req, res) {
  try {
    const users = await UserModel.findClients();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
},

async getBanned(req, res) {
  try {
    const users = await UserModel.findBanned();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
},

async banClient(req, res) {
  try {
    await UserModel.updateRole(req.params.id, 'banned');
    res.json({ message: 'Cliente dado de baja correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
},

async unbanClient(req, res) {
  try {
    await UserModel.updateRole(req.params.id, 'user');
    res.json({ message: 'Cliente reactivado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
},

async deleteUser(req, res) {
  try {
    await UserModel.deleteUser(req.params.id);
    res.json({ message: 'Usuario eliminado permanentemente' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
},

async getClientInfo(req, res) {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
},
};

module.exports = adminController;
