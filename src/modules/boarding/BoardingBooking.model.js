const { Schema, model, Types } = require('mongoose');

const boardingBookingSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true },
  pet_id: { type: Types.ObjectId, ref: 'Pet', required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  total_days: { type: Number, required: true },
  status: {
    type: String,
    enum: ['requested', 'approved', 'active', 'completed', 'rejected'],
    default: 'requested',
  },
  notes: String,
}, { timestamps: true });

module.exports = model('BoardingBooking', boardingBookingSchema);
