const router = require('express').Router();
const ctrl = require('./pets.controller');
const { verifyToken } = require('../../middleware/auth');

router.use(verifyToken);
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/image', ctrl.uploadImage);

module.exports = router;
