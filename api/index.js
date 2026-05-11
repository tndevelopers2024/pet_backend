require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../src/index');

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 });
}

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
