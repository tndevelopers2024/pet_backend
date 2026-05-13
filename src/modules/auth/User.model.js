const { Schema, model } = require('mongoose');

const addressSchema = new Schema({
  line1: { type: String, default: '' },
  line2: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  postal_code: { type: String, default: '' },
  country: { type: String, default: 'India' },
}, { _id: false });

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  phone: { type: String, default: '' },
  address: { type: addressSchema, default: () => ({}) },
  identity_proof_url: { type: String, default: '' },
  onboarding_complete: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = model('User', userSchema);
