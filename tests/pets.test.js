process.env.NODE_ENV = 'test';
require('dotenv').config();

const request = require('supertest');
const app = require('../src/index');
const { setupTestDB, teardownTestDB } = require('./helpers/db');

let cookie, userId;

beforeAll(setupTestDB);
afterAll(teardownTestDB);

beforeEach(async () => {
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Jane', email: `jane_${Date.now()}@test.com`, password: 'pass123'
  });
  userId = reg.body._id;
  const login = await request(app).post('/api/auth/login').send({
    email: reg.body.email, password: 'pass123'
  });
  cookie = login.headers['set-cookie'];
});

describe('POST /api/pets', () => {
  it('creates a pet for the logged-in user', async () => {
    const res = await request(app).post('/api/pets').set('Cookie', cookie).send({
      name: 'Buddy', breed: 'Labrador', age: 3, notes: 'Friendly'
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Buddy');
    expect(res.body.user_id).toBe(userId);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/pets').send({ name: 'Buddy' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/pets', () => {
  it('returns only the logged-in user pets', async () => {
    await request(app).post('/api/pets').set('Cookie', cookie).send({ name: 'Buddy', breed: 'Lab', age: 2 });
    await request(app).post('/api/pets').set('Cookie', cookie).send({ name: 'Max', breed: 'Poodle', age: 4 });
    const res = await request(app).get('/api/pets').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('PUT /api/pets/:id', () => {
  it('updates a pet', async () => {
    const create = await request(app).post('/api/pets').set('Cookie', cookie).send({ name: 'Buddy', breed: 'Lab', age: 2 });
    const res = await request(app).put(`/api/pets/${create.body._id}`).set('Cookie', cookie).send({ name: 'Buddy Updated', age: 3 });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Buddy Updated');
  });
});

describe('DELETE /api/pets/:id', () => {
  it('deletes a pet', async () => {
    const create = await request(app).post('/api/pets').set('Cookie', cookie).send({ name: 'Buddy', breed: 'Lab', age: 2 });
    await request(app).delete(`/api/pets/${create.body._id}`).set('Cookie', cookie);
    const list = await request(app).get('/api/pets').set('Cookie', cookie);
    expect(list.body).toHaveLength(0);
  });
});
