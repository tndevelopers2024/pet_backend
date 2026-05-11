const petsService = require('./pets.service');

async function create(req, res) {
  try {
    const pet = await petsService.createPet(req.user.id, req.body);
    res.status(201).json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function list(req, res) {
  const pets = await petsService.getPetsByUser(req.user.id);
  res.json(pets);
}

async function update(req, res) {
  try {
    const pet = await petsService.updatePet(req.params.id, req.user.id, req.body);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    await petsService.deletePet(req.params.id, req.user.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function uploadImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const imageUrl = `/uploads/pets/${req.file.filename}`;
    const pet = await petsService.updatePetImage(req.params.id, req.user.id, imageUrl);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { create, list, update, remove, uploadImage };
