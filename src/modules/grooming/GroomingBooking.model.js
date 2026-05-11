const { Schema, model, Types } = require('mongoose');

const groomingBookingSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true },
  pet_id: { type: Types.ObjectId, ref: 'Pet', required: true },
  slot_id: { type: Types.ObjectId, ref: 'TimeSlot', required: true },
  service_type: { type: String, enum: ['bath', 'haircut', 'bath_haircut'], required: true },
  payment_mode: { type: String, enum: ['single', 'package'], default: 'single' },
  package_id: { type: Types.ObjectId, ref: 'GroomingPackage', default: null },
  status: { type: String, enum: ['confirmed', 'completed', 'cancelled'], default: 'confirmed' },
}, { timestamps: true });

module.exports = model('GroomingBooking', groomingBookingSchema);
