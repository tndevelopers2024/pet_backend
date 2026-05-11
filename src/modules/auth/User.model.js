const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, { timestamps: true });

module.exports = model('User', userSchema);
