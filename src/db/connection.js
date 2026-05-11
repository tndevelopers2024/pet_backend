const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    family: 4,
  });
}

async function disconnectDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
