const router = require('express').Router();
const ctrl = require('./slots.controller');
const { verifyToken, requireAdmin } = require('../../middleware/auth');

router.get('/', verifyToken, ctrl.list);
router.post('/', verifyToken, requireAdmin, ctrl.create);
router.delete('/:id', verifyToken, requireAdmin, ctrl.remove);

module.exports = router;
