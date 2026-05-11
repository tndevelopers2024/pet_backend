const { Schema, model } = require('mongoose');

const packageOptionSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  credits: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = model('PackageOption', packageOptionSchema);
