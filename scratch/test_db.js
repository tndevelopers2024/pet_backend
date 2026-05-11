const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/arundurai/Public/Prasanna Works/Pet/cutz-to-cuddlez/backend/.env' });

const uri = process.env.MONGODB_URI;
console.log('Connecting to:', uri.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
