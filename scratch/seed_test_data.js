const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '/Users/arundurai/Public/Prasanna Works/Pet/cutz-to-cuddlez/backend/.env' });

const User = require('../src/modules/auth/User.model');
const Pet = require('../src/modules/pets/Pet.model.js');
const PackageOption = require('../src/modules/packages/PackageOption.model.js');
const Slot = require('../src/modules/slots/TimeSlot.model.js');
const Boarding = require('../src/modules/boarding/BoardingBooking.model.js');
const Grooming = require('../src/modules/grooming/GroomingBooking.model.js');

const uri = process.env.MONGODB_URI;

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Clear existing test data
    console.log('Cleaning up existing test data...');
    await Promise.all([
      User.deleteMany({ email: { $in: ['john@example.com', 'alice@example.com', 'bob@example.com'] } }),
      PackageOption.deleteMany({ name: { $in: ['Bronze Package', 'Silver Package', 'Gold Package'] } }),
      Slot.deleteMany({}),
      Pet.deleteMany({ name: { $in: ['Buddy', 'Max', 'Luna'] } }),
      Boarding.deleteMany({}),
      Grooming.deleteMany({})
    ]);

    // 1. Create Package Options
    console.log('Seeding Package Options...');
    const packageOptions = await PackageOption.insertMany([
      { name: 'Bronze Package', description: '3 standard grooming sessions', price: 2500, credits: 3 },
      { name: 'Silver Package', description: '6 premium grooming sessions', price: 4500, credits: 6 },
      { name: 'Gold Package', description: '12 luxury grooming sessions', price: 8000, credits: 12 },
    ]);

    // 2. Create some Users
    console.log('Seeding Users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = await User.insertMany([
      { name: 'John Doe', email: 'john@example.com', password_hash: passwordHash, role: 'customer' },
      { name: 'Alice Smith', email: 'alice@example.com', password_hash: passwordHash, role: 'customer' },
      { name: 'Bob Wilson', email: 'bob@example.com', password_hash: passwordHash, role: 'customer' },
    ]);

    // 3. Create some Pets
    console.log('Seeding Pets...');
    const pets = await Pet.insertMany([
      { name: 'Buddy', breed: 'Golden Retriever', age: 3, user_id: users[0]._id, notes: 'Very friendly' },
      { name: 'Max', breed: 'German Shepherd', age: 5, user_id: users[1]._id, notes: 'Afraid of loud noises' },
      { name: 'Luna', breed: 'Persian Cat', age: 2, user_id: users[2]._id, notes: 'Needs gentle handling' },
    ]);

    // 4. Create some Slots
    console.log('Seeding Slots...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const slots = await Slot.insertMany([
      { slot_date: today.toISOString().split('T')[0], slot_time: '10:00', service_type: 'bath', capacity: 3, booked_count: 0 },
      { slot_date: today.toISOString().split('T')[0], slot_time: '14:00', service_type: 'haircut', capacity: 2, booked_count: 0 },
      { slot_date: tomorrow.toISOString().split('T')[0], slot_time: '11:00', service_type: 'bath_haircut', capacity: 2, booked_count: 0 },
    ]);

    // 5. Create some Bookings
    console.log('Seeding Bookings...');
    await Boarding.create({
      user_id: users[0]._id,
      pet_id: pets[0]._id,
      start_date: today,
      end_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      total_days: 3,
      status: 'requested',
      notes: 'Please feed twice a day'
    });

    console.log('Test data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
