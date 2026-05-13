const User = require('../auth/User.model');
const Pet = require('../pets/Pet.model');
const BoardingBooking = require('../boarding/BoardingBooking.model');
const GroomingBooking = require('../grooming/GroomingBooking.model');
const TrainingBooking = require('../training/TrainingBooking.model');

async function submitOnboarding(userId, data) {
  const { phone, address, identity_proof_url, pets: petInputs = [] } = data;

  const user = await User.findByIdAndUpdate(
    userId,
    { phone, address, identity_proof_url, onboarding_complete: true },
    { new: true, select: '-password_hash' }
  );

  const createdPets = [];
  const createdBookings = [];

  const createdGrooming = [];
  const createdTraining = [];

  for (const petData of petInputs) {
    const { boarding_bookings = [], wants_grooming, wants_training, wants_boarding, ...petFields } = petData;

    const pet = await Pet.create({
      user_id: userId,
      wants_grooming: !!wants_grooming,
      wants_training: !!wants_training,
      wants_boarding: !!wants_boarding,
      ...petFields,
    });
    createdPets.push(pet);

    if (wants_grooming) {
      const g = await GroomingBooking.create({
        user_id: userId,
        pet_id: pet._id,
        status: 'requested',
        notes: 'Requested during onboarding',
      });
      createdGrooming.push(g);
    }

    if (wants_training) {
      const preferredDate = new Date();
      preferredDate.setDate(preferredDate.getDate() + 7);
      const t = await TrainingBooking.create({
        user_id: userId,
        pet_id: pet._id,
        training_type: 'Obedience Training',
        preferred_date: preferredDate,
        session_duration: '60 min',
        status: 'requested',
        notes: 'Requested during onboarding',
      });
      createdTraining.push(t);
    }

    for (const booking of boarding_bookings) {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      const total_days = Math.max(
        1,
        Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      );
      const b = await BoardingBooking.create({
        user_id: userId,
        pet_id: pet._id,
        start_date: start,
        end_date: end,
        total_days,
        boarding_type: booking.boarding_type || 'Overnight',
        add_on_services: booking.add_on_services || [],
      });
      createdBookings.push(b);
    }
  }

  return { user, pets: createdPets, boardingBookings: createdBookings, groomingBookings: createdGrooming, trainingBookings: createdTraining };
}

module.exports = { submitOnboarding };
