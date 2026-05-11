const Notification = require('./Notification.model');

async function create({ recipient_id, type, title, message }) {
  return Notification.create({ recipient_id, type, title, message });
}

async function getForUser(userId) {
  return Notification.find({ recipient_id: userId }).sort({ createdAt: -1 }).limit(50).lean();
}

async function getUnreadCount(userId) {
  return Notification.countDocuments({ recipient_id: userId, read: false });
}

async function markRead(notificationId, userId) {
  return Notification.findOneAndUpdate({ _id: notificationId, recipient_id: userId }, { read: true }, { new: true });
}

async function markAllRead(userId) {
  return Notification.updateMany({ recipient_id: userId, read: false }, { read: true });
}

module.exports = { create, getForUser, getUnreadCount, markRead, markAllRead };
