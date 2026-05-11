const { Schema, model } = require('mongoose');

const timeSlotSchema = new Schema({
  slot_date: { type: Date, required: true },
  slot_time: { type: String, required: true },
  service_type: { type: String, enum: ['bath', 'haircut', 'bath_haircut'], required: true },
  capacity: { type: Number, required: true, default: 3 },
  booked_count: { type: Number, default: 0 },
}, { timestamps: true });

timeSlotSchema.index({ slot_date: 1, slot_time: 1, service_type: 1 }, { unique: true });

module.exports = model('TimeSlot', timeSlotSchema);
