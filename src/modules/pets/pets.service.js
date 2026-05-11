const Pet = require('./Pet.model');

async function createPet(userId, { name, breed, age, notes }) {
  return Pet.create({ user_id: userId, name, breed, age, notes });
}

async function getPetsByUser(userId) {
  return Pet.find({ user_id: userId }).lean();
}

async function updatePet(petId, userId, fields) {
  return Pet.findOneAndUpdate(
    { _id: petId, user_id: userId },
    { $set: fields },
    { new: true }
  ).lean();
}

async function deletePet(petId, userId) {
  await Pet.findOneAndDelete({ _id: petId, user_id: userId });
}

async function updatePetImage(petId, userId, imageUrl) {
  return Pet.findOneAndUpdate(
    { _id: petId, user_id: userId },
    { $set: { image_url: imageUrl } },
    { new: true }
  ).lean();
}

module.exports = { createPet, getPetsByUser, updatePet, deletePet, updatePetImage };
