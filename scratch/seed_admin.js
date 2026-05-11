const mongoose = require('mongoose');
const User = require('../src/modules/auth/User.model');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '/Users/arundurai/Public/Prasanna Works/Pet/cutz-to-cuddlez/backend/.env' });

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    const email = 'admin@cutztocuddlez.com';
    const password = 'admin123';
    
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin already exists:', email);
    } else {
      const hash = await bcrypt.hash(password, 10);
      await User.create({
        name: 'Super Admin',
        email,
        password_hash: hash,
        role: 'admin'
      });
      console.log('Admin created successfully!');
      console.log('Email:', email);
      console.log('Password:', password);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
