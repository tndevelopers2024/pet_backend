const groomingService = require('./grooming.service');
const notifService = require('../notifications/notifications.service');
const emailService = require('../../services/email.service');
const User = require('../auth/User.model');
const TimeSlot = require('../slots/TimeSlot.model');
const dayjs = require('dayjs');

async function getAdmin() {
  return User.findOne({ role: 'admin' }).lean();
}

const SERVICE_LABELS = { bath: 'Bath Only', haircut: 'Haircut Only', bath_haircut: 'Bath + Haircut' };

async function create(req, res) {
  try {
    const booking = await groomingService.createBooking(req.user.id, req.body);
    const [user, admin, slot] = await Promise.all([
      User.findById(req.user.id).lean(),
      getAdmin(),
      TimeSlot.findById(req.body.slot_id).lean(),
    ]);
    const slotDate = slot ? dayjs(slot.slot_date).format('MMM D, YYYY') : '';
    const slotTime = slot?.slot_time || '';
    const service = SERVICE_LABELS[req.body.service_type] || req.body.service_type;

    Promise.all([
      admin && notifService.create({
        recipient_id: admin._id,
        type: 'grooming_booked',
        title: 'New Grooming Appointment',
        message: `${user.name} booked ${service} on ${slotDate} at ${slotTime}.`,
      }),
      notifService.create({
        recipient_id: req.user.id,
        type: 'grooming_booked',
        title: 'Grooming Booked! ✂️',
        message: `${service} confirmed for ${slotDate} at ${slotTime}.`,
      }),
      admin && emailService.sendGroomingBookedAdmin({
        adminEmail: admin.email,
        userName: user.name,
        petName: '',
        serviceType: req.body.service_type,
        slotDate,
        slotTime,
      }),
      emailService.sendGroomingConfirmation({
        userEmail: user.email,
        userName: user.name,
        petName: '',
        serviceType: req.body.service_type,
        slotDate,
        slotTime,
      }),
    ]).catch(err => console.error('[Notification error]', err));

    res.status(201).json(booking);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function cancel(req, res) {
  try {
    const bookingBefore = await require('./GroomingBooking.model')
      .findById(req.params.id).populate('slot_id').lean();
    await groomingService.cancelBooking(req.params.id, req.user.id);
    const [user, admin] = await Promise.all([
      User.findById(req.user.id).lean(),
      getAdmin(),
    ]);
    const slotDate = bookingBefore?.slot_id ? dayjs(bookingBefore.slot_id.slot_date).format('MMM D, YYYY') : '';
    const slotTime = bookingBefore?.slot_id?.slot_time || '';

    Promise.all([
      admin && notifService.create({
        recipient_id: admin._id,
        type: 'grooming_cancelled',
        title: 'Grooming Cancelled',
        message: `${user.name} cancelled their grooming on ${slotDate} at ${slotTime}.`,
      }),
      admin && emailService.sendGroomingCancelledAdmin({
        adminEmail: admin.email,
        userName: user.name,
        petName: '',
        slotDate,
        slotTime,
      }),
    ]).catch(err => console.error('[Notification error]', err));

    res.json({ message: 'Cancelled' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function list(req, res) {
  const bookings = await groomingService.getUserBookings(req.user.id);
  res.json(bookings);
}

async function listAll(req, res) {
  const bookings = await groomingService.getAllBookings();
  res.json(bookings);
}

module.exports = { create, cancel, list, listAll };
