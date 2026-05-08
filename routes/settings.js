const express            = require('express');
const router             = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken, onlyAdmin } = require('../middleware/auth');

// GET /api/settings/horario — público
router.get('/horario', settingsController.getHorario);

// PATCH /api/settings/horario — solo admin
router.patch('/horario', verifyToken, onlyAdmin, settingsController.updateHorario);

module.exports = router;