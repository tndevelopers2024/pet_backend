const { Schema, model, Types } = require('mongoose');

const groomingPackageSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true },
  package_option_id: { type: Types.ObjectId, ref: 'PackageOption', required: true },
  name: String,
  price: Number,
  total_credits: { type: Number, required: true },
  used_credits: { type: Number, default: 0 },
  expires_at: Date,
}, { timestamps: true });

groomingPackageSchema.virtual('available_credits').get(function () {
  return this.total_credits - this.used_credits;
});

groomingPackageSchema.set('toJSON', { virtuals: true });

module.exports = model('GroomingPackage', groomingPackageSchema);
