const notifService = require('./notifications.service');

async function list(req, res) {
  const notifications = await notifService.getForUser(req.user.id);
  res.json(notifications);
}

async function unreadCount(req, res) {
  const count = await notifService.getUnreadCount(req.user.id);
  res.json({ count });
}

async function markRead(req, res) {
  const n = await notifService.markRead(req.params.id, req.user.id);
  res.json(n);
}

async function markAllRead(req, res) {
  await notifService.markAllRead(req.user.id);
  res.json({ ok: true });
}

module.exports = { list, unreadCount, markRead, markAllRead };
