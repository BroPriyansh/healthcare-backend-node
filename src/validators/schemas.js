const { z } = require('zod');

const name = z.string().trim().min(2).max(100);
const email = z.string().trim().email().max(254).transform((v) => v.toLowerCase());
const phone = z.string().trim().min(7).max(25).optional().or(z.literal(''));
const registerSchema = z.object({
  name,
  email,
  password: z.string().min(8).max(72).regex(/[A-Za-z]/, 'Password must contain a letter').regex(/[0-9]/, 'Password must contain a number')
}).strict();

const patientSchema = z.object({
  name,
  age: z.number().int().min(0).max(130),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  address: z.string().trim().min(3).max(500),
  phone
}).strict();

const doctorSchema = z.object({
  name,
  specialization: z.string().trim().min(2).max(100),
  email,
  phone,
  clinic_address: z.string().trim().max(500).optional().or(z.literal(''))
}).strict();

const mappingSchema = z.object({
  patient_id: z.number().int().positive(),
  doctor_id: z.number().int().positive()
}).strict();

module.exports = { registerSchema, patientSchema, doctorSchema, mappingSchema };
