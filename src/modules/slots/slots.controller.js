const slotsService = require('./slots.service');

async function create(req, res) {
  try {
    const slot = await slotsService.createSlot(req.body);
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function list(req, res) {
  const { service_type } = req.query;
  const slots = service_type
    ? await slotsService.getAvailableSlots(service_type)
    : await slotsService.getAllSlots();
  res.json(slots);
}

async function remove(req, res) {
  await slotsService.deleteSlot(req.params.id);
  res.json({ message: 'Deleted' });
}

module.exports = { create, list, remove };
