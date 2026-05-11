const packagesService = require('./packages.service');

async function purchase(req, res) {
  try {
    const pkg = await packagesService.purchasePackage(req.user.id, req.body.packageOptionId);
    res.status(201).json(pkg);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function list(req, res) {
  const packages = await packagesService.getUserPackages(req.user.id);
  res.json(packages);
}

async function listOptions(req, res) {
  const options = await packagesService.getPackageOptions();
  res.json(options);
}

async function listAllOptions(req, res) {
  const options = await packagesService.getAllPackageOptions();
  res.json(options);
}

async function createOption(req, res) {
  try {
    const option = await packagesService.createPackageOption(req.body);
    res.status(201).json(option);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteOption(req, res) {
  try {
    await packagesService.deletePackageOption(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function toggleOption(req, res) {
  try {
    const option = await packagesService.togglePackageOption(req.params.id);
    res.json(option);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function listPublicOptions(req, res) {
  const options = await packagesService.getPackageOptions();
  res.json(options);
}

module.exports = { purchase, list, listOptions, listAllOptions, createOption, deleteOption, toggleOption, listPublicOptions };
