const BoardingBooking = require('./BoardingBooking.model');

function daysBetween(start, end) {
  return Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
}

async function createBooking(userId, { pet_id, start_date, end_date, notes }) {
  const total_days = daysBetween(start_date, end_date);
  if (total_days <= 0) throw { status: 400, message: 'end_date must be after start_date' };
  return BoardingBooking.create({
    user_id: userId, pet_id, start_date: new Date(start_date),
    end_date: new Date(end_date), total_days, notes,
  });
}

async function getBookingsByUser(userId) {
  return BoardingBooking.find({ user_id: userId })
    .populate('pet_id', 'name image_url')
    .sort({ createdAt: -1 })
    .lean();
}

async function getAllBookings() {
  return BoardingBooking.find()
    .populate('pet_id', 'name image_url')
    .populate('user_id', 'name email')
    .sort({ createdAt: -1 })
    .lean();
}

async function updateStatus(bookingId, status) {
  return BoardingBooking.findByIdAndUpdate(bookingId, { status }, { new: true }).lean();
}

module.exports = { createBooking, getBookingsByUser, getAllBookings, updateStatus };
