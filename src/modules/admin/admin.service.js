const User = require('../auth/User.model');
const BoardingBooking = require('../boarding/BoardingBooking.model');
const GroomingBooking = require('../grooming/GroomingBooking.model');
const TrainingBooking = require('../training/TrainingBooking.model');
const TimeSlot = require('../slots/TimeSlot.model');
const GroomingPackage = require('../packages/GroomingPackage.model');

async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    total_customers,
    boarding_today,
    pending_boarding,
    groomingSlots,
    total_boarding,
    total_grooming,
    packages_sold,
    recent_boarding,
    recent_grooming,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    BoardingBooking.countDocuments({
      status: { $in: ['active', 'approved'] },
      start_date: { $lte: tomorrow },
      end_date: { $gte: today },
    }),
    BoardingBooking.countDocuments({ status: 'requested' }),
    TimeSlot.find({ slot_date: { $gte: today, $lt: tomorrow } }).select('_id'),
    BoardingBooking.countDocuments(),
    GroomingBooking.countDocuments({ status: { $ne: 'cancelled' } }),
    GroomingPackage.countDocuments(),
    BoardingBooking.find({ status: 'requested' })
      .sort({ createdAt: -1 }).limit(5)
      .populate('user_id', 'name').populate('pet_id', 'name')
      .lean(),
    GroomingBooking.find({ createdAt: { $gte: weekAgo } })
      .sort({ createdAt: -1 }).limit(5)
      .populate('user_id', 'name').populate('pet_id', 'name')
      .populate('slot_id', 'slot_date slot_time').lean(),
  ]);

  const slotIds = groomingSlots.map(s => s._id);
  const grooming_today = await GroomingBooking.countDocuments({
    slot_id: { $in: slotIds },
    status: 'confirmed',
  });

  return {
    total_customers,
    boarding_today,
    grooming_today,
    pending_boarding,
    total_boarding,
    total_grooming,
    packages_sold,
    recent_boarding,
    recent_grooming,
  };
}

async function getUsers() {
  const users = await User.find({ role: 'customer' })
    .select('-password_hash')
    .sort({ createdAt: -1 })
    .lean();

  const ids = users.map(u => u._id);
  const [boardingCounts, groomingCounts, trainingCounts, petCounts] = await Promise.all([
    BoardingBooking.aggregate([{ $match: { user_id: { $in: ids } } }, { $group: { _id: '$user_id', count: { $sum: 1 } } }]),
    GroomingBooking.aggregate([{ $match: { user_id: { $in: ids }, status: { $ne: 'cancelled' } } }, { $group: { _id: '$user_id', count: { $sum: 1 } } }]),
    TrainingBooking.aggregate([{ $match: { user_id: { $in: ids }, status: { $ne: 'cancelled' } } }, { $group: { _id: '$user_id', count: { $sum: 1 } } }]),
    require('../pets/Pet.model').aggregate([{ $match: { user_id: { $in: ids } } }, { $group: { _id: '$user_id', count: { $sum: 1 } } }]),
  ]);

  const toMap = arr => Object.fromEntries(arr.map(x => [x._id.toString(), x.count]));
  const bMap = toMap(boardingCounts), gMap = toMap(groomingCounts), tMap = toMap(trainingCounts), pMap = toMap(petCounts);

  return users.map(u => ({
    ...u,
    boarding_count: bMap[u._id.toString()] || 0,
    grooming_count: gMap[u._id.toString()] || 0,
    training_count: tMap[u._id.toString()] || 0,
    pet_count: pMap[u._id.toString()] || 0,
  }));
}

async function getUserDetail(userId) {
  const user = await User.findById(userId).select('-password_hash').lean();
  if (!user) throw { status: 404, message: 'User not found' };

  const Pet = require('../pets/Pet.model');
  const [pets, boarding, grooming, training] = await Promise.all([
    Pet.find({ user_id: userId }).lean(),
    BoardingBooking.find({ user_id: userId }).populate('pet_id', 'name').sort({ createdAt: -1 }).lean(),
    GroomingBooking.find({ user_id: userId }).populate('pet_id', 'name').populate('slot_id', 'slot_date slot_time').sort({ createdAt: -1 }).lean(),
    TrainingBooking.find({ user_id: userId }).populate('pet_id', 'name').sort({ createdAt: -1 }).lean(),
  ]);

  return { user, pets, boarding, grooming, training };
}

async function getBoardingDetail(id) {
  const booking = await BoardingBooking.findById(id)
    .populate('user_id', 'name email createdAt')
    .populate('pet_id', 'name breed age notes image_url')
    .lean();
  if (!booking) throw { status: 404, message: 'Booking not found' };
  return booking;
}

async function getGroomingDetail(id) {
  const booking = await GroomingBooking.findById(id)
    .populate('user_id', 'name email createdAt')
    .populate('pet_id', 'name breed age notes image_url')
    .populate('slot_id', 'slot_date slot_time')
    .populate('package_id', 'name sessions_total price')
    .lean();
  if (!booking) throw { status: 404, message: 'Booking not found' };
  return booking;
}

async function updateBoardingStatus(id, status) {
  const booking = await BoardingBooking.findByIdAndUpdate(id, { status }, { new: true })
    .populate('user_id', 'name email')
    .populate('pet_id', 'name breed age notes image_url')
    .lean();
  if (!booking) throw { status: 404, message: 'Booking not found' };
  return booking;
}

async function updateGroomingStatus(id, status) {
  const booking = await GroomingBooking.findByIdAndUpdate(id, { status }, { new: true })
    .populate('user_id', 'name email')
    .populate('pet_id', 'name breed age notes image_url')
    .populate('slot_id', 'slot_date slot_time')
    .lean();
  if (!booking) throw { status: 404, message: 'Booking not found' };
  return booking;
}

async function createTrainingBooking({ user_id, pet_id, training_type, preferred_date, session_duration, notes }) {
  const booking = await TrainingBooking.create({
    user_id, pet_id, training_type, preferred_date, session_duration: session_duration || '60 min',
    status: 'confirmed', notes: notes || '',
  });
  return TrainingBooking.findById(booking._id)
    .populate('user_id', 'name email')
    .populate('pet_id', 'name breed')
    .lean();
}

async function getTrainingBookings() {
  return TrainingBooking.find()
    .populate('user_id', 'name email')
    .populate('pet_id', 'name breed')
    .sort({ createdAt: -1 })
    .lean();
}

async function updateTrainingStatus(id, status) {
  const booking = await TrainingBooking.findByIdAndUpdate(id, { status }, { new: true })
    .populate('user_id', 'name email')
    .populate('pet_id', 'name breed')
    .lean();
  if (!booking) throw { status: 404, message: 'Booking not found' };
  return booking;
}

module.exports = { getDashboardStats, getUsers, getUserDetail, getBoardingDetail, getGroomingDetail, updateBoardingStatus, updateGroomingStatus, getTrainingBookings, createTrainingBooking, updateTrainingStatus };
