const router = require('express').Router();
const ctrl = require('./notifications.controller');
const { verifyToken } = require('../../middleware/auth');

router.use(verifyToken);
router.get('/', ctrl.list);
router.get('/unread-count', ctrl.unreadCount);
router.patch('/:id/read', ctrl.markRead);
router.patch('/mark-all-read', ctrl.markAllRead);

module.exports = router;
