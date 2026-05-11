const jwt = require('jsonwebtoken');
const authService = require('./auth.service');

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  secure: isProd,
};

async function register(req, res) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const user = await authService.login(req.body);
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('token', token, COOKIE_OPTS).json({ ...user, token });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function logout(req, res) {
  res.clearCookie('token', COOKIE_OPTS).json({ message: 'Logged out' });
}

async function me(req, res) {
  const user = await authService.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}

module.exports = { register, login, logout, me };
