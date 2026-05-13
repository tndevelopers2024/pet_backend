const TrainingBooking = require('./TrainingBooking.model');

async function createBooking(userId, { pet_id, training_type, preferred_date, session_duration, notes }) {
  return TrainingBooking.create({
    user_id: userId, pet_id, training_type, preferred_date, session_duration, notes: notes || '',
  });
}

async function cancelBooking(bookingId, userId) {
  const booking = await TrainingBooking.findOne({ _id: bookingId, user_id: userId });
  if (!booking) throw { status: 404, message: 'Booking not found' };
  if (['completed', 'cancelled'].includes(booking.status))
    throw { status: 400, message: 'Cannot cancel this booking' };
  await TrainingBooking.findByIdAndUpdate(bookingId, { status: 'cancelled' });
}

async function getUserBookings(userId) {
  return TrainingBooking.find({ user_id: userId })
    .populate('pet_id', 'name image_url breed')
    .sort({ createdAt: -1 })
    .lean();
}

async function getAllBookings() {
  return TrainingBooking.find()
    .populate('pet_id', 'name image_url breed')
    .populate('user_id', 'name email')
    .sort({ createdAt: -1 })
    .lean();
}

async function updateStatus(bookingId, status) {
  const booking = await TrainingBooking.findByIdAndUpdate(bookingId, { status }, { new: true })
    .populate('user_id', 'name email')
    .populate('pet_id', 'name breed')
    .lean();
  if (!booking) throw { status: 404, message: 'Booking not found' };
  return booking;
}

module.exports = { createBooking, cancelBooking, getUserBookings, getAllBookings, updateStatus };
