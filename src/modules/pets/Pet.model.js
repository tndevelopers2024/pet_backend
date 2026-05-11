const { Schema, model, Types } = require('mongoose');

const petSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  breed: String,
  age: Number,
  notes: String,
  image_url: String,
}, { timestamps: true });

module.exports = model('Pet', petSchema);
