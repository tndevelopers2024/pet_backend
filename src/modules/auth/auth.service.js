const bcrypt = require('bcryptjs');
const User = require('./User.model');

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw { status: 409, message: 'Email already registered' };
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password_hash: hash });
  const obj = user.toObject();
  delete obj.password_hash;
  return obj;
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw { status: 401, message: 'Invalid credentials' };
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw { status: 401, message: 'Invalid credentials' };
  return { _id: user._id, name: user.name, email: user.email, role: user.role };
}

async function getUserById(id) {
  return User.findById(id).select('-password_hash').lean();
}

module.exports = { register, login, getUserById };
