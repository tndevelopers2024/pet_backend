const TimeSlot = require('./TimeSlot.model');

async function createSlot({ slot_date, slot_time, service_type, capacity }) {
  return TimeSlot.create({ slot_date: new Date(slot_date), slot_time, service_type, capacity });
}

async function getAllSlots() {
  return TimeSlot.find().sort({ slot_date: 1, slot_time: 1 }).lean();
}

async function getAvailableSlots(service_type) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return TimeSlot.find({
    service_type,
    slot_date: { $gte: startOfToday },
    $expr: { $lt: ['$booked_count', '$capacity'] },
  }).sort({ slot_date: 1, slot_time: 1 }).lean();
}

async function deleteSlot(id) {
  await TimeSlot.findByIdAndDelete(id);
}

module.exports = { createSlot, getAllSlots, getAvailableSlots, deleteSlot };
