const express            = require('express');
const router             = express.Router();
const messageController  = require('../controllers/messageController');
const { verifyToken }    = require('../middleware/auth');


// Todas las rutas requieren token
router.use(verifyToken);


// GET  /api/messages/:ticketId  → obtener mensajes de un ticket
router.get('/:ticketId', messageController.getByTicket);


// POST /api/messages/:ticketId  → enviar mensaje en un ticket
router.post('/:ticketId', messageController.create);


module.exports = router;

