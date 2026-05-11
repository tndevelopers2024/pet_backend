const GroomingPackage = require('./GroomingPackage.model');
const PackageOption = require('./PackageOption.model');

async function createPackageOption(data) {
  return PackageOption.create(data);
}

async function getPackageOptions() {
  return PackageOption.find({ isActive: true });
}

async function getAllPackageOptions() {
  return PackageOption.find();
}

async function purchasePackage(userId, packageOptionId) {
  const option = await PackageOption.findById(packageOptionId);
  if (!option) throw { status: 404, message: 'Package option not found' };
  
  return GroomingPackage.create({ 
    user_id: userId,
    package_option_id: option._id,
    name: option.name,
    price: option.price,
    total_credits: option.credits
  });
}

async function getUserPackages(userId) {
  return GroomingPackage.find({ user_id: userId }).sort({ createdAt: -1 });
}

async function getPackageWithAvailableCredits(packageId, userId) {
  const pkg = await GroomingPackage.findOne({ _id: packageId, user_id: userId });
  if (!pkg || pkg.available_credits <= 0) return null;
  return pkg;
}

async function deductCredit(packageId) {
  await GroomingPackage.findByIdAndUpdate(packageId, { $inc: { used_credits: 1 } });
}

async function returnCredit(packageId) {
  await GroomingPackage.findByIdAndUpdate(packageId, { $inc: { used_credits: -1 } });
}

async function deletePackageOption(id) {
  return PackageOption.findByIdAndDelete(id);
}

async function togglePackageOption(id) {
  const option = await PackageOption.findById(id);
  if (!option) throw { status: 404, message: 'Package option not found' };
  option.isActive = !option.isActive;
  return option.save();
}

module.exports = { createPackageOption, getPackageOptions, getAllPackageOptions, deletePackageOption, togglePackageOption, purchasePackage, getUserPackages, getPackageWithAvailableCredits, deductCredit, returnCredit };
