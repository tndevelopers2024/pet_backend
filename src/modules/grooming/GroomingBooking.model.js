const { Schema, model, Types } = require('mongoose');

const groomingBookingSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true },
  pet_id: { type: Types.ObjectId, ref: 'Pet', required: true },
  slot_id: { type: Types.ObjectId, ref: 'TimeSlot', default: null },
  service_type: { type: String, enum: ['bath', 'haircut', 'bath_haircut', ''], default: '' },
  payment_mode: { type: String, enum: ['single', 'package'], default: 'single' },
  package_id: { type: Types.ObjectId, ref: 'GroomingPackage', default: null },
  status: { type: String, enum: ['requested', 'confirmed', 'completed', 'cancelled'], default: 'confirmed' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = model('GroomingBooking', groomingBookingSchema);
