const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const createMapping = asyncHandler(async (req, res) => {
  const { patient_id, doctor_id } = req.body;
  const patient = await db.query('SELECT id FROM patients WHERE id=$1 AND user_id=$2', [patient_id, req.user.id]);
  if (!patient.rowCount) return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found or not owned by your account.' } });
  const doctor = await db.query('SELECT id FROM doctors WHERE id=$1', [doctor_id]);
  if (!doctor.rowCount) return res.status(404).json({ error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor not found.' } });
  const result = await db.query(
    `INSERT INTO patient_doctors (patient_id, doctor_id, assigned_by)
     VALUES ($1,$2,$3)
     ON CONFLICT (patient_id, doctor_id) DO NOTHING
     RETURNING id, patient_id, doctor_id, assigned_by, created_at`,
    [patient_id, doctor_id, req.user.id]
  );
  if (!result.rowCount) return res.status(409).json({ error: { code: 'DUPLICATE_MAPPING', message: 'This doctor is already assigned to this patient.' } });
  res.status(201).json({ mapping: result.rows[0] });
});

const listMappings = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT m.id, m.patient_id, p.name AS patient_name, m.doctor_id, d.name AS doctor_name,
            d.specialization, m.assigned_by, m.created_at
     FROM patient_doctors m
     JOIN patients p ON p.id=m.patient_id
     JOIN doctors d ON d.id=m.doctor_id
     WHERE p.user_id=$1 ORDER BY m.created_at DESC`,
    [req.user.id]
  );
  res.json({ count: result.rowCount, mappings: result.rows });
});

const getPatientDoctors = asyncHandler(async (req, res) => {
  const patient = await db.query('SELECT id FROM patients WHERE id=$1 AND user_id=$2', [req.params.patient_id, req.user.id]);
  if (!patient.rowCount) return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found or not owned by your account.' } });
  const result = await db.query(
    `SELECT m.id AS mapping_id, d.id AS doctor_id, d.name, d.specialization, d.email, d.phone,
            d.clinic_address, m.created_at AS assigned_at
     FROM patient_doctors m JOIN doctors d ON d.id=m.doctor_id
     WHERE m.patient_id=$1 ORDER BY d.name`,
    [req.params.patient_id]
  );
  res.json({ patient_id: Number(req.params.patient_id), count: result.rowCount, doctors: result.rows });
});

const deleteMapping = asyncHandler(async (req, res) => {
  const result = await db.query(
    `DELETE FROM patient_doctors m USING patients p
     WHERE m.patient_id=p.id AND m.id=$1 AND p.user_id=$2 RETURNING m.id`,
    [req.params.id, req.user.id]
  );
  if (!result.rowCount) return res.status(404).json({ error: { code: 'MAPPING_NOT_FOUND', message: 'Mapping not found.' } });
  res.status(204).send();
});

module.exports = { createMapping, listMappings, getPatientDoctors, deleteMapping };
