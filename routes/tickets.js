const express          = require('express');
const router           = express.Router();
const ticketController = require('../controllers/ticketController');
const { verifyToken, onlySupport } = require('../middleware/auth');


// Todas las rutas requieren token
router.use(verifyToken);


// GET  /api/tickets/categories  → listar categorías (cualquier rol)
router.get('/categories', ticketController.getCategories);


// GET  /api/tickets/all         → todos los tickets (solo soporte)
router.get('/all', onlySupport, ticketController.getAll);


// GET  /api/tickets             → tickets del usuario logueado
router.get('/', ticketController.getMyTickets);


// POST /api/tickets             → crear ticket (usuario)
router.post('/', ticketController.create);


// GET  /api/tickets/:id         → ver un ticket
router.get('/:id', ticketController.getById);


// PATCH /api/tickets/:id        → actualizar ticket (soporte)
router.patch('/:id', onlySupport, ticketController.update);


module.exports = router;

router.delete('/:id', ticketController.delete);