const SettingsModel = require('../models/settingsModel');

const settingsController = {

  async getHorario(req, res) {
    try {
      const setting = await SettingsModel.get('horario_atencion');
      res.json({ value: setting ? setting.value : '' });
    } catch (err) {
      console.error('Error en getHorario:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async updateHorario(req, res) {
    try {
      const { value } = req.body;
      if (!value) return res.status(400).json({ message: 'El valor es requerido' });
      await SettingsModel.update('horario_atencion', value);
      res.json({ message: 'Horario actualizado correctamente' });
    } catch (err) {
      console.error('Error en updateHorario:', err.message);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

};

module.exports = settingsController;