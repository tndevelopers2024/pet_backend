process.env.NODE_ENV = 'test';
require('dotenv').config();

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/index');
const User = require('../src/modules/auth/User.model');
const { setupTestDB, teardownTestDB } = require('./helpers/db');

let adminCookie;

beforeAll(async () => {
  await setupTestDB();
  const hash = await bcrypt.hash('admin123', 10);
  const admin = await User.create({ name: 'Admin', email: `admin_${Date.now()}@test.com`, password_hash: hash, role: 'admin' });
  const a = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'admin123' });
  adminCookie = a.headers['set-cookie'];
});
afterAll(teardownTestDB);

describe('GET /api/admin/dashboard', () => {
  it('returns stats with required keys', async () => {
    const res = await request(app).get('/api/admin/dashboard').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total_customers');
    expect(res.body).toHaveProperty('boarding_today');
    expect(res.body).toHaveProperty('grooming_today');
    expect(res.body).toHaveProperty('pending_boarding');
  });

  it('returns 403 for non-admin', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'Jane', email: `jane_${Date.now()}@test.com`, password: 'pass123' });
    const c = await request(app).post('/api/auth/login').send({ email: reg.body.email, password: 'pass123' });
    const res = await request(app).get('/api/admin/dashboard').set('Cookie', c.headers['set-cookie']);
    expect(res.status).toBe(403);
  });
});
