const router = require('express').Router();
const ctrl = require('./packages.controller');
const { verifyToken, requireAdmin } = require('../../middleware/auth');

// Public — no auth required
router.get('/public', ctrl.listPublicOptions);

// Authenticated user routes
router.get('/options', verifyToken, ctrl.listOptions);
router.post('/purchase', verifyToken, ctrl.purchase);
router.get('/', verifyToken, ctrl.list);

// Admin only
router.get('/admin/options', verifyToken, requireAdmin, ctrl.listAllOptions);
router.post('/admin/options', verifyToken, requireAdmin, ctrl.createOption);
router.delete('/admin/options/:id', verifyToken, requireAdmin, ctrl.deleteOption);
router.patch('/admin/options/:id/toggle', verifyToken, requireAdmin, ctrl.toggleOption);

module.exports = router;
