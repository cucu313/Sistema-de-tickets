const express         = require('express');
const router          = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, onlyAdmin } = require('../middleware/auth');

router.use(verifyToken, onlyAdmin);

// GET  /api/admin/pending      → listar pendientes
router.get('/pending', adminController.getPending);

// GET  /api/admin/support      → listar soporte aprobado
router.get('/support', adminController.getSupport);

// PATCH /api/admin/approve/:id → aprobar
router.patch('/approve/:id', adminController.approve);

// PATCH /api/admin/reject/:id  → rechazar
router.patch('/reject/:id', adminController.reject);

module.exports = router;
