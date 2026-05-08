const express         = require('express');
const router          = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, onlyAdmin } = require('../middleware/auth');

router.use(verifyToken, onlyAdmin);

router.get('/pending',         adminController.getPending);
router.get('/support',         adminController.getSupport);
router.get('/suspended',       adminController.getSuspended);
router.patch('/approve/:id',   adminController.approve);
router.patch('/reject/:id',    adminController.reject);
router.patch('/role/:id',      adminController.changeRole);
router.get('/clients',          adminController.getClients);
router.get('/banned',           adminController.getBanned);
router.patch('/ban/:id',        adminController.banClient);
router.patch('/unban/:id',      adminController.unbanClient);
router.delete('/user/:id',      adminController.deleteUser);
router.get('/client-info/:id',  adminController.getClientInfo);

module.exports = router;
