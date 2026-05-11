process.env.NODE_ENV = 'test';
require('dotenv').config();

const request = require('supertest');
const app = require('../src/index');
const { setupTestDB, teardownTestDB } = require('./helpers/db');

let cookie;

beforeAll(async () => {
  await setupTestDB();
  const reg = await request(app).post('/api/auth/register').send({ name: 'Jane', email: `jane_${Date.now()}@test.com`, password: 'pass123' });
  const login = await request(app).post('/api/auth/login').send({ email: reg.body.email, password: 'pass123' });
  cookie = login.headers['set-cookie'];
});
afterAll(teardownTestDB);

describe('POST /api/packages/purchase', () => {
  it('creates a package with 3 credits', async () => {
    const res = await request(app).post('/api/packages/purchase').set('Cookie', cookie).send({});
    expect(res.status).toBe(201);
    expect(res.body.total_credits).toBe(3);
    expect(res.body.used_credits).toBe(0);
    expect(res.body.available_credits).toBe(3);
  });
});

describe('GET /api/packages', () => {
  it('lists packages with available_credits', async () => {
    await request(app).post('/api/packages/purchase').set('Cookie', cookie).send({});
    const res = await request(app).get('/api/packages').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].available_credits).toBe(3);
  });
});
