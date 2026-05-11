process.env.NODE_ENV = 'test';
require('dotenv').config();

const request = require('supertest');
const app = require('../src/index');
const { setupTestDB, teardownTestDB } = require('./helpers/db');

beforeAll(setupTestDB);
afterAll(teardownTestDB);

describe('POST /api/auth/register', () => {
  it('registers a new user and returns 201', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe', email: 'jane@example.com', password: 'password123'
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.email).toBe('jane@example.com');
    expect(res.body).not.toHaveProperty('password_hash');
  });

  it('returns 409 if email already exists', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Jane', email: 'dupe@example.com', password: 'password123'
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane2', email: 'dupe@example.com', password: 'other'
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Jane', email: 'login@example.com', password: 'password123'
    });
  });

  it('returns 200 and sets cookie on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com', password: 'password123'
    });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.body.email).toBe('login@example.com');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com', password: 'wrongpass'
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns user when authenticated', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Me User', email: 'me@example.com', password: 'password123'
    });
    const login = await request(app).post('/api/auth/login').send({
      email: 'me@example.com', password: 'password123'
    });
    const cookie = login.headers['set-cookie'];
    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('me@example.com');
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
