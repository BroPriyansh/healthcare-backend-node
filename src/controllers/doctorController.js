const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const fields = 'id, name, specialization, email, phone, clinic_address, created_at, updated_at';

const createDoctor = asyncHandler(async (req, res) => {
  const { name, specialization, email, phone = '', clinic_address = '' } = req.body;
  const result = await db.query(
    `INSERT INTO doctors (name, specialization, email, phone, clinic_address)
     VALUES ($1,$2,$3,$4,$5) RETURNING ${fields}`,
    [name, specialization, email, phone, clinic_address]
  );
  res.status(201).json({ doctor: result.rows[0] });
});

const listDoctors = asyncHandler(async (req, res) => {
  const result = await db.query(`SELECT ${fields} FROM doctors ORDER BY name ASC`);
  res.json({ count: result.rowCount, doctors: result.rows });
});

const getDoctor = asyncHandler(async (req, res) => {
  const result = await db.query(`SELECT ${fields} FROM doctors WHERE id=$1`, [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor not found.' } });
  res.json({ doctor: result.rows[0] });
});

const updateDoctor = asyncHandler(async (req, res) => {
  const { name, specialization, email, phone = '', clinic_address = '' } = req.body;
  const result = await db.query(
    `UPDATE doctors SET name=$1, specialization=$2, email=$3, phone=$4, clinic_address=$5, updated_at=NOW()
     WHERE id=$6 RETURNING ${fields}`,
    [name, specialization, email, phone, clinic_address, req.params.id]
  );
  if (!result.rowCount) return res.status(404).json({ error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor not found.' } });
  res.json({ message: 'Doctor updated successfully.', doctor: result.rows[0] });
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const result = await db.query('DELETE FROM doctors WHERE id=$1 RETURNING id', [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor not found.' } });
  res.status(204).send();
});

module.exports = { createDoctor, listDoctors, getDoctor, updateDoctor, deleteDoctor };
