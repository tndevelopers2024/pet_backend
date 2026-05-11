const GroomingBooking = require('./GroomingBooking.model');
const TimeSlot = require('../slots/TimeSlot.model');
const packagesService = require('../packages/packages.service');

async function createBooking(userId, { pet_id, slot_id, service_type, payment_mode, package_id }) {
  const slot = await TimeSlot.findById(slot_id);
  if (!slot) throw { status: 404, message: 'Slot not found' };
  if (slot.booked_count >= slot.capacity) throw { status: 400, message: 'Slot is full' };

  if (payment_mode === 'package') {
    const pkg = await packagesService.getPackageWithAvailableCredits(package_id, userId);
    if (!pkg) throw { status: 400, message: 'No credits available in this package' };
    await packagesService.deductCredit(package_id);
  }

  await TimeSlot.findByIdAndUpdate(slot_id, { $inc: { booked_count: 1 } });

  try {
    const booking = await GroomingBooking.create({
      user_id: userId, pet_id, slot_id, service_type, payment_mode,
      package_id: package_id || null,
    });
    return booking;
  } catch (err) {
    // Rollback slot count and credit if booking creation fails
    await TimeSlot.findByIdAndUpdate(slot_id, { $inc: { booked_count: -1 } });
    if (payment_mode === 'package' && package_id) {
      await packagesService.returnCredit(package_id);
    }
    throw err;
  }
}

async function cancelBooking(bookingId, userId) {
  const booking = await GroomingBooking.findOne({ _id: bookingId, user_id: userId });
  if (!booking) throw { status: 404, message: 'Booking not found' };

  await GroomingBooking.findByIdAndUpdate(bookingId, { status: 'cancelled' });
  await TimeSlot.findByIdAndUpdate(booking.slot_id, { $inc: { booked_count: -1 } });

  if (booking.payment_mode === 'package' && booking.package_id) {
    await packagesService.returnCredit(booking.package_id);
  }
}

async function getUserBookings(userId) {
  return GroomingBooking.find({ user_id: userId })
    .populate('pet_id', 'name image_url')
    .populate('slot_id', 'slot_date slot_time')
    .sort({ createdAt: -1 })
    .lean();
}

async function getAllBookings() {
  return GroomingBooking.find()
    .populate('pet_id', 'name image_url')
    .populate('user_id', 'name email')
    .populate('slot_id', 'slot_date slot_time')
    .sort({ createdAt: -1 })
    .lean();
}

module.exports = { createBooking, cancelBooking, getUserBookings, getAllBookings };
