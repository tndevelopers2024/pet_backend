const adminService = require('./admin.service');

async function dashboard(req, res) {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function users(req, res) {
  try {
    const list = await adminService.getUsers();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function userDetail(req, res) {
  try {
    const data = await adminService.getUserDetail(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function boardingDetail(req, res) {
  try {
    const data = await adminService.getBoardingDetail(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function groomingDetail(req, res) {
  try {
    const data = await adminService.getGroomingDetail(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function updateBoardingStatus(req, res) {
  try {
    const data = await adminService.updateBoardingStatus(req.params.id, req.body.status);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function updateGroomingStatus(req, res) {
  try {
    const data = await adminService.updateGroomingStatus(req.params.id, req.body.status);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { dashboard, users, userDetail, boardingDetail, groomingDetail, updateBoardingStatus, updateGroomingStatus };
