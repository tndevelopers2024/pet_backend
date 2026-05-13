const trainingService = require('./training.service');
const notifService = require('../notifications/notifications.service');
const User = require('../auth/User.model');
const dayjs = require('dayjs');

async function getAdmin() {
  return User.findOne({ role: 'admin' }).lean();
}

async function create(req, res) {
  try {
    const booking = await trainingService.createBooking(req.user.id, req.body);
    const [user, admin] = await Promise.all([User.findById(req.user.id).lean(), getAdmin()]);
    const dateStr = dayjs(req.body.preferred_date).format('MMM D, YYYY');

    Promise.all([
      admin && notifService.create({
        recipient_id: admin._id,
        type: 'training_booked',
        title: 'New Training Request',
        message: `${user.name} requested ${req.body.training_type} on ${dateStr}.`,
      }),
      notifService.create({
        recipient_id: req.user.id,
        type: 'training_booked',
        title: 'Training Requested! 🐕',
        message: `${req.body.training_type} request received for ${dateStr}. We'll confirm shortly.`,
      }),
    ]).catch(err => console.error('[Notification error]', err));

    res.status(201).json(booking);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function cancel(req, res) {
  try {
    await trainingService.cancelBooking(req.params.id, req.user.id);
    res.json({ message: 'Cancelled' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function list(req, res) {
  const bookings = await trainingService.getUserBookings(req.user.id);
  res.json(bookings);
}

async function listAll(req, res) {
  const bookings = await trainingService.getAllBookings();
  res.json(bookings);
}

async function updateStatus(req, res) {
  try {
    const booking = await trainingService.updateStatus(req.params.id, req.body.status);

    const [user] = await Promise.all([User.findById(booking.user_id?._id || booking.user_id).lean()]);
    if (user) {
      const label = { confirmed: 'confirmed', active: 'started', completed: 'completed', cancelled: 'cancelled' }[req.body.status] || req.body.status;
      notifService.create({
        recipient_id: user._id,
        type: 'training_status',
        title: 'Training Update',
        message: `Your ${booking.training_type} session has been ${label}.`,
      }).catch(() => {});
    }

    res.json(booking);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { create, cancel, list, listAll, updateStatus };
