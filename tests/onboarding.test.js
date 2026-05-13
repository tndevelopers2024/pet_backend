process.env.NODE_ENV = 'test';
require('dotenv').config();

const request = require('supertest');
const app = require('../src/index');
const { setupTestDB, teardownTestDB } = require('./helpers/db');

beforeAll(setupTestDB);
afterAll(teardownTestDB);

let authCookie;

beforeAll(async () => {
  await request(app).post('/api/auth/register').send({
    name: 'Test Owner', email: 'onboard@test.com', password: 'pass1234',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'onboard@test.com', password: 'pass1234',
  });
  authCookie = login.headers['set-cookie'];
});

describe('POST /api/onboarding', () => {
  it('saves owner profile fields and creates pets', async () => {
    const payload = {
      phone: '+919876543210',
      address: {
        line1: '12 Main St', line2: 'Apt 3', city: 'Chennai',
        state: 'Tamil Nadu', postal_code: '600001', country: 'India',
      },
      pets: [
        {
          name: 'Buddy',
          breed: 'Golden Retriever',
          gender: 'Male',
          weight_kg: 25,
          size: 'Large',
          coat: 'Long',
          birthday: '2022-03-15',
          behaviours: ['Playful', 'Barks a lot'],
          meals: [
            { time: 'Morning', diet: 'Dry kibble', quantity: '1 cup' },
            { time: 'Evening', diet: 'Wet food', quantity: '0.5 cup' },
          ],
          dietary_preference: 'Non-vegetarian',
          allergies: 'None',
          vaccination: {
            is_neutered_spayed: true,
            is_vaccinated: true,
            tick_prevention: false,
            last_deworming_date: '2025-01-10',
          },
          medical: {
            ongoing_medication: false,
            illness_history: 'NA',
            vet_name: 'Dr Smith',
            vet_phone: '+919876500000',
            guardian_name: 'Uncle Bob',
            guardian_phone: '+919876500001',
          },
          boarding_bookings: [
            {
              start_date: '2026-06-01',
              end_date: '2026-06-03',
              boarding_type: 'Overnight',
              add_on_services: ['Tick and Flea Bath'],
            },
          ],
        },
      ],
    };

    const res = await request(app)
      .post('/api/onboarding')
      .set('Cookie', authCookie)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.pets).toHaveLength(1);
    expect(res.body.pets[0].name).toBe('Buddy');
    expect(res.body.pets[0].behaviours).toContain('Playful');
    expect(res.body.pets[0].vaccination.is_neutered_spayed).toBe(true);
    expect(res.body.pets[0].medical.vet_name).toBe('Dr Smith');
    expect(res.body.boardingBookings).toHaveLength(1);
    expect(res.body.boardingBookings[0].boarding_type).toBe('Overnight');
    expect(res.body.user.onboarding_complete).toBe(true);
    expect(res.body.user.phone).toBe('+919876543210');
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/onboarding').send({ pets: [] });
    expect(res.status).toBe(401);
  });
});
