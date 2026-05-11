process.env.NODE_ENV = 'test';
require('dotenv').config();

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/index');
const User = require('../src/modules/auth/User.model');
const { setupTestDB, teardownTestDB } = require('./helpers/db');

let cookie, petId, slotId, packageId, adminCookie;

beforeAll(async () => {
  await setupTestDB();

  const reg = await request(app).post('/api/auth/register').send({ name: 'Jane', email: `jane_${Date.now()}@test.com`, password: 'pass123' });
  const c = await request(app).post('/api/auth/login').send({ email: reg.body.email, password: 'pass123' });
  cookie = c.headers['set-cookie'];

  const pet = await request(app).post('/api/pets').set('Cookie', cookie).send({ name: 'Buddy', breed: 'Lab', age: 2 });
  petId = pet.body._id;

  const hash = await bcrypt.hash('admin123', 10);
  const admin = await User.create({ name: 'Admin', email: `admin_${Date.now()}@test.com`, password_hash: hash, role: 'admin' });
  const a = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'admin123' });
  adminCookie = a.headers['set-cookie'];

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const slot = await request(app).post('/api/slots').set('Cookie', adminCookie).send({
    slot_date: tomorrow, slot_time: '09:00', service_type: 'bath', capacity: 5
  });
  slotId = slot.body._id;

  const pkg = await request(app).post('/api/packages/purchase').set('Cookie', cookie).send({});
  packageId = pkg.body._id;
});
afterAll(teardownTestDB);

describe('POST /api/grooming (single payment)', () => {
  it('creates a confirmed grooming booking', async () => {
    const slot2 = await request(app).post('/api/slots').set('Cookie', adminCookie).send({
      slot_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      slot_time: '10:00', service_type: 'bath', capacity: 5
    });
    const res = await request(app).post('/api/grooming').set('Cookie', cookie).send({
      pet_id: petId, slot_id: slot2.body._id, service_type: 'bath', payment_mode: 'single'
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('confirmed');
    expect(res.body.payment_mode).toBe('single');
  });
});

describe('POST /api/grooming (package payment)', () => {
  it('deducts a credit from the package', async () => {
    const res = await request(app).post('/api/grooming').set('Cookie', cookie).send({
      pet_id: petId, slot_id: slotId, service_type: 'bath', payment_mode: 'package', package_id: packageId
    });
    expect(res.status).toBe(201);
    const pkgs = await request(app).get('/api/packages').set('Cookie', cookie);
    expect(pkgs.body[0].available_credits).toBe(2);
  });
});

describe('DELETE /api/grooming/:id (cancellation)', () => {
  it('returns credit when package booking is cancelled', async () => {
    const slot3 = await request(app).post('/api/slots').set('Cookie', adminCookie).send({
      slot_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      slot_time: '11:00', service_type: 'bath', capacity: 5
    });
    const booking = await request(app).post('/api/grooming').set('Cookie', cookie).send({
      pet_id: petId, slot_id: slot3.body._id, service_type: 'bath', payment_mode: 'package', package_id: packageId
    });
    await request(app).delete(`/api/grooming/${booking.body._id}`).set('Cookie', cookie);
    const pkgs = await request(app).get('/api/packages').set('Cookie', cookie);
    // Credits should have returned (were at 2 from previous test, went to 1, then back to 2)
    expect(pkgs.body[0].available_credits).toBe(2);
  });
});
