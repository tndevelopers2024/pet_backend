const boardingService = require('./boarding.service');
const notifService = require('../notifications/notifications.service');
const emailService = require('../../services/email.service');
const User = require('../auth/User.model');
const dayjs = require('dayjs');

async function getAdmin() {
  return User.findOne({ role: 'admin' }).lean();
}

function fmt(date) { return dayjs(date).format('MMM D, YYYY'); }

async function create(req, res) {
  try {
    const booking = await boardingService.createBooking(req.user.id, req.body);
    const [user, admin] = await Promise.all([
      User.findById(req.user.id).lean(),
      getAdmin(),
    ]);
    const pet = booking.pet_id;
    const petName = req.body.pet_name || 'your pet';
    const startDate = fmt(booking.start_date);
    const endDate = fmt(booking.end_date);

    // Fire notifications + emails (non-blocking)
    Promise.all([
      // Notify admin
      admin && notifService.create({
        recipient_id: admin._id,
        type: 'boarding_requested',
        title: 'New Boarding Request',
        message: `${user.name} requested boarding for ${startDate} → ${endDate}`,
      }),
      // Notify user
      notifService.create({
        recipient_id: req.user.id,
        type: 'boarding_requested',
        title: 'Boarding Request Submitted',
        message: `Your request for ${startDate} → ${endDate} is under review.`,
      }),
      // Emails
      admin && emailService.sendBoardingRequestedAdmin({
        adminEmail: admin.email,
        userName: user.name,
        petName: petName,
        startDate,
        endDate,
        totalDays: booking.total_days,
      }),
      emailService.sendBoardingConfirmation({
        userEmail: user.email,
        userName: user.name,
        petName: petName,
        startDate,
        endDate,
        totalDays: booking.total_days,
      }),
    ]).catch(err => console.error('[Notification error]', err));

    res.status(201).json(booking);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function list(req, res) {
  const bookings = await boardingService.getBookingsByUser(req.user.id);
  res.json(bookings);
}

async function listAll(req, res) {
  const bookings = await boardingService.getAllBookings();
  res.json(bookings);
}

async function approve(req, res) {
  const booking = await boardingService.updateStatus(req.params.id, 'approved');
  // Notify + email user
  Promise.all([
    User.findById(booking.user_id).lean().then(async user => {
      if (!user) return;
      await notifService.create({
        recipient_id: user._id,
        type: 'boarding_approved',
        title: 'Boarding Approved! 🎉',
        message: `Your boarding request (${fmt(booking.start_date)} → ${fmt(booking.end_date)}) has been approved.`,
      });
      await emailService.sendBoardingApproved({
        userEmail: user.email,
        userName: user.name,
        petName: '',
        startDate: fmt(booking.start_date),
        endDate: fmt(booking.end_date),
      });
    }),
  ]).catch(err => console.error('[Notification error]', err));
  res.json(booking);
}

async function reject(req, res) {
  const booking = await boardingService.updateStatus(req.params.id, 'rejected');
  Promise.all([
    User.findById(booking.user_id).lean().then(async user => {
      if (!user) return;
      await notifService.create({
        recipient_id: user._id,
        type: 'boarding_rejected',
        title: 'Boarding Request Update',
        message: `Your boarding request (${fmt(booking.start_date)} → ${fmt(booking.end_date)}) could not be accommodated.`,
      });
      await emailService.sendBoardingRejected({
        userEmail: user.email,
        userName: user.name,
        petName: '',
      });
    }),
  ]).catch(err => console.error('[Notification error]', err));
  res.json(booking);
}

module.exports = { create, list, listAll, approve, reject };
