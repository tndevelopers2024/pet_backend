const router = require('express').Router();
const ctrl = require('./boarding.controller');
const { verifyToken, requireAdmin } = require('../../middleware/auth');

router.use(verifyToken);
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/all', requireAdmin, ctrl.listAll);
router.put('/:id/approve', requireAdmin, ctrl.approve);
router.put('/:id/reject', requireAdmin, ctrl.reject);

module.exports = router;
