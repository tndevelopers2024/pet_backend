const { Schema, model, Types } = require('mongoose');

const mealSchema = new Schema({
  time: { type: String, default: '' },
  diet: { type: String, default: '' },
  quantity: { type: String, default: '' },
}, { _id: false });

const vaccinationSchema = new Schema({
  is_neutered_spayed: { type: Boolean, default: null },
  is_vaccinated: { type: Boolean, default: null },
  tick_prevention: { type: Boolean, default: null },
  last_deworming_date: { type: Date, default: null },
}, { _id: false });

const medicalSchema = new Schema({
  ongoing_medication: { type: Boolean, default: null },
  illness_history: { type: String, default: '' },
  vet_name: { type: String, default: '' },
  vet_phone: { type: String, default: '' },
  guardian_name: { type: String, default: '' },
  guardian_phone: { type: String, default: '' },
}, { _id: false });

const BEHAVIOURS = [
  'Playful', 'Fussy', 'Knows commands', 'Barks a lot', 'Chewing habit',
  'Sensitive to touch', 'Food guarding', 'Resource guarding',
  'Aggressive towards dogs', 'Aggressive towards people',
  'Nervous/Anxious with other dogs', 'Nervous/Anxious with new people',
  'Separation anxiety', 'Mounting other dogs',
];

const petSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  breed: { type: String, default: '' },
  age: { type: Number, default: null },
  birthday: { type: Date, default: null },
  gender: { type: String, enum: ['Male', 'Female', ''], default: '' },
  weight_kg: { type: Number, default: null },
  size: { type: String, enum: ['Small', 'Medium', 'Large', ''], default: '' },
  coat: { type: String, enum: ['Short', 'Medium', 'Long', ''], default: '' },
  behaviours: {
    type: [{ type: String, enum: BEHAVIOURS }],
    default: [],
  },
  meals: { type: [mealSchema], default: [] },
  dietary_preference: {
    type: String,
    enum: ['Non-vegetarian', 'Vegetarian', 'Eggetarian', ''],
    default: '',
  },
  allergies: { type: String, default: '' },
  vaccination: { type: vaccinationSchema, default: () => ({}) },
  medical: { type: medicalSchema, default: () => ({}) },
  notes: { type: String, default: '' },
  image_url: { type: String, default: '' },
  wants_grooming:  { type: Boolean, default: false },
  wants_training:  { type: Boolean, default: false },
  wants_boarding:  { type: Boolean, default: false },
}, { timestamps: true });

const Pet = model('Pet', petSchema);
Pet.BEHAVIOURS = BEHAVIOURS;

module.exports = Pet;
