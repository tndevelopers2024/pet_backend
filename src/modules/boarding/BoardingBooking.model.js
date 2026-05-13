const { Schema, model, Types } = require('mongoose');

const ADD_ON_SERVICES = ['Tick and Flea Bath', 'De-Shedding Treatment', 'Medicated Bath'];

const boardingBookingSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true },
  pet_id: { type: Types.ObjectId, ref: 'Pet', required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  total_days: { type: Number, required: true },
  boarding_type: {
    type: String,
    enum: ['Overnight', 'Day'],
    default: 'Overnight',
  },
  add_on_services: {
    type: [{ type: String, enum: ADD_ON_SERVICES }],
    default: [],
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'active', 'completed', 'rejected'],
    default: 'requested',
  },
  notes: { type: String, default: '' },
}, { timestamps: true });

const BoardingBooking = model('BoardingBooking', boardingBookingSchema);
BoardingBooking.ADD_ON_SERVICES = ADD_ON_SERVICES;

module.exports = BoardingBooking;
