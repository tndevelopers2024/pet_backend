const { submitOnboarding } = require('./onboarding.service');
const User = require('../auth/User.model');

async function submit(req, res) {
  try {
    const result = await submitOnboarding(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ message: err.message || 'Onboarding failed' });
  }
}

async function uploadIdentityProof(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // File is in req.file.buffer — wire up cloud storage (Cloudinary/S3) to persist it
    const url = req.file.originalname;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { identity_proof_url: url },
      { new: true, select: '-password_hash' }
    );
    res.json({ identity_proof_url: url, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { submit, uploadIdentityProof };
