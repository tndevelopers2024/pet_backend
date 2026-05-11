const router = require('express').Router();
const ctrl = require('./grooming.controller');
const { verifyToken, requireAdmin } = require('../../middleware/auth');

router.use(verifyToken);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.cancel);
router.get('/', ctrl.list);
router.get('/all', requireAdmin, ctrl.listAll);

module.exports = router;
