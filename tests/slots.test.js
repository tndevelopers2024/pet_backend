process.env.NODE_ENV = 'test';
require('dotenv').config();

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/index');
const User = require('../src/modules/auth/User.model');
const { setupTestDB, teardownTestDB } = require('./helpers/db');

let adminCookie, customerCookie;

beforeAll(async () => {
  await setupTestDB();
  const hash = await bcrypt.hash('admin123', 10);
  await User.create({ name: 'Admin', email: `admin_${Date.now()}@test.com`, password_hash: hash, role: 'admin' });
  const admin = await User.findOne({ role: 'admin' });
  const a = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'admin123' });
  adminCookie = a.headers['set-cookie'];

  const reg = await request(app).post('/api/auth/register').send({ name: 'Jane', email: `jane_${Date.now()}@test.com`, password: 'pass123' });
  const c = await request(app).post('/api/auth/login').send({ email: reg.body.email, password: 'pass123' });
  customerCookie = c.headers['set-cookie'];
});
afterAll(teardownTestDB);

describe('POST /api/slots', () => {
  it('admin can create a slot', async () => {
    const res = await request(app).post('/api/slots').set('Cookie', adminCookie).send({
      slot_date: '2026-06-01', slot_time: '09:00', service_type: 'bath', capacity: 3
    });
    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
  });

  it('customer cannot create a slot', async () => {
    const res = await request(app).post('/api/slots').set('Cookie', customerCookie).send({
      slot_date: '2026-06-01', slot_time: '09:00', service_type: 'bath', capacity: 3
    });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/slots', () => {
  it('returns slots list', async () => {
    await request(app).post('/api/slots').set('Cookie', adminCookie).send({
      slot_date: '2026-06-02', slot_time: '10:00', service_type: 'haircut', capacity: 2
    });
    const res = await request(app).get('/api/slots').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
