const { Schema, model, Types } = require('mongoose');

const TRAINING_TYPES = [
  'Obedience Training',
  'Puppy Training',
  'Behavioral Correction',
  'Agility Training',
  'Advanced Commands',
  'Socialisation',
];

const trainingBookingSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true },
  pet_id:  { type: Types.ObjectId, ref: 'Pet',  required: true },
  training_type: {
    type: String,
    enum: TRAINING_TYPES,
    required: true,
  },
  preferred_date: { type: Date, required: true },
  session_duration: {
    type: String,
    enum: ['30 min', '60 min', '90 min'],
    default: '60 min',
  },
  status: {
    type: String,
    enum: ['requested', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'requested',
  },
  notes: { type: String, default: '' },
}, { timestamps: true });

const TrainingBooking = model('TrainingBooking', trainingBookingSchema);
TrainingBooking.TRAINING_TYPES = TRAINING_TYPES;

module.exports = TrainingBooking;
