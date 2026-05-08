const db = require('../db');

const SettingsModel = {

  async get(key_name) {
    const [rows] = await db.query(
      'SELECT * FROM settings WHERE key_name = ?',
      [key_name]
    );
    return rows[0] || null;
  },

  async update(key_name, value) {
    await db.query(
      'UPDATE settings SET value = ? WHERE key_name = ?',
      [value, key_name]
    );
  },

};

module.exports = SettingsModel;