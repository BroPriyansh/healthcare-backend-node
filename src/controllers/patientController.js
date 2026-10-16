const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const createPatient = asyncHandler(async (req, res) => {
  const { name, age, gender, address, phone = '' } = req.body;
  const result = await db.query(
    `INSERT INTO patients (user_id, name, age, gender, address, phone)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, name, age, gender, address, phone, created_at, updated_at`,
    [req.user.id, name, age, gender, address, phone]
  );
  res.status(201).json({ patient: result.rows[0] });
});

const listPatients = asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT id, user_id, name, age, gender, address, phone, created_at, updated_at FROM patients WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json({ count: result.rowCount, patients: result.rows });
});

const getPatient = asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT id, user_id, name, age, gender, address, phone, created_at, updated_at FROM patients WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  if (!result.rowCount) return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' } });
  res.json({ patient: result.rows[0] });
});

const updatePatient = asyncHandler(async (req, res) => {
  const { name, age, gender, address, phone = '' } = req.body;
  const result = await db.query(
    `UPDATE patients SET name=$1, age=$2, gender=$3, address=$4, phone=$5, updated_at=NOW()
     WHERE id=$6 AND user_id=$7
     RETURNING id, user_id, name, age, gender, address, phone, created_at, updated_at`,
    [name, age, gender, address, phone, req.params.id, req.user.id]
  );
  if (!result.rowCount) return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' } });
  res.json({ message: 'Patient updated successfully.', patient: result.rows[0] });
});

const deletePatient = asyncHandler(async (req, res) => {
  const result = await db.query('DELETE FROM patients WHERE id=$1 AND user_id=$2 RETURNING id', [req.params.id, req.user.id]);
  if (!result.rowCount) return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' } });
  res.status(204).send();
});

module.exports = { createPatient, listPatients, getPatient, updatePatient, deletePatient };
