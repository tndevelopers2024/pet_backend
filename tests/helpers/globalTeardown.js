const mongoose = require('mongoose');

module.exports = async function () {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
};
