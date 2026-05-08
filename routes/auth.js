const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

//ruta registrarse
// POST /api/auth/register
router.post('/register', authController.register);

//ruta registrarse como soporte
// POST /api/auth/register-soporte
router.post('/register-soporte', authController.registerSoporte);

//ruta de iniciar sección
// POST /api/auth/login
router.post('/login', authController.login);

//ruta del token
// GET /api/auth/me  (requiere token)
router.get('/me', verifyToken, authController.me);
router.patch('/update', verifyToken, authController.update);

//ruta de recuperar cuenta
//POST /api/auth/recover
router.post('/recover', authController.recover);

module.exports = router;
