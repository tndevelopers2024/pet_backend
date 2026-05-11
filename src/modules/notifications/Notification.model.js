const { Schema, model, Types } = require('mongoose');

const notificationSchema = new Schema({
  recipient_id: { type: Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'boarding_requested', 'boarding_approved', 'boarding_rejected',
      'grooming_booked', 'grooming_cancelled',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = model('Notification', notificationSchema);
