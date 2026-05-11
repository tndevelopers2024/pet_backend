const mongoose = require('mongoose');
const User = require('../src/modules/auth/User.model');
require('dotenv').config({ path: '/Users/arundurai/Public/Prasanna Works/Pet/cutz-to-cuddlez/backend/.env' });

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    const admins = await User.find({ role: 'admin' });
    console.log('Admins found:', admins.map(a => ({ name: a.name, email: a.email })));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
