process.env.NODE_ENV = 'test';
require('dotenv').config();

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/index');
const User = require('../src/modules/auth/User.model');
const { setupTestDB, teardownTestDB } = require('./helpers/db');

let customerCookie, adminCookie, petId;

beforeAll(async () => {
  await setupTestDB();
  const reg = await request(app).post('/api/auth/register').send({ name: 'Jane', email: `jane_${Date.now()}@test.com`, password: 'pass123' });
  const c = await request(app).post('/api/auth/login').send({ email: reg.body.email, password: 'pass123' });
  customerCookie = c.headers['set-cookie'];

  const pet = await request(app).post('/api/pets').set('Cookie', customerCookie).send({ name: 'Buddy', breed: 'Lab', age: 2 });
  petId = pet.body._id;

  const hash = await bcrypt.hash('admin123', 10);
  const admin = await User.create({ name: 'Admin', email: `admin_${Date.now()}@test.com`, password_hash: hash, role: 'admin' });
  const a = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'admin123' });
  adminCookie = a.headers['set-cookie'];
});
afterAll(teardownTestDB);

describe('POST /api/boarding', () => {
  it('creates a booking with status requested and correct total_days', async () => {
    const res = await request(app).post('/api/boarding').set('Cookie', customerCookie).send({
      pet_id: petId, start_date: '2026-06-01', end_date: '2026-06-05', notes: 'Allergic to chicken'
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('requested');
    expect(res.body.total_days).toBe(4);
  });
});

describe('GET /api/boarding', () => {
  it('customer sees only their bookings', async () => {
    await request(app).post('/api/boarding').set('Cookie', customerCookie).send({
      pet_id: petId, start_date: '2026-06-01', end_date: '2026-06-03'
    });
    const res = await request(app).get('/api/boarding').set('Cookie', customerCookie);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('PUT /api/boarding/:id/approve', () => {
  it('admin can approve a booking', async () => {
    const create = await request(app).post('/api/boarding').set('Cookie', customerCookie).send({
      pet_id: petId, start_date: '2026-06-01', end_date: '2026-06-03'
    });
    const res = await request(app).put(`/api/boarding/${create.body._id}/approve`).set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });

  it('customer cannot approve', async () => {
    const create = await request(app).post('/api/boarding').set('Cookie', customerCookie).send({
      pet_id: petId, start_date: '2026-06-01', end_date: '2026-06-03'
    });
    const res = await request(app).put(`/api/boarding/${create.body._id}/approve`).set('Cookie', customerCookie);
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/boarding/:id/reject', () => {
  it('admin can reject a booking', async () => {
    const create = await request(app).post('/api/boarding').set('Cookie', customerCookie).send({
      pet_id: petId, start_date: '2026-06-01', end_date: '2026-06-03'
    });
    const res = await request(app).put(`/api/boarding/${create.body._id}/reject`).set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('rejected');
  });
});
