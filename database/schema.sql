CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  age SMALLINT NOT NULL CHECK (age BETWEEN 0 AND 130),
  gender VARCHAR(30) NOT NULL CHECK (gender IN ('male','female','other','prefer_not_to_say')),
  address VARCHAR(500) NOT NULL,
  phone VARCHAR(25) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);

CREATE TABLE IF NOT EXISTS doctors (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  phone VARCHAR(25) NOT NULL DEFAULT '',
  clinic_address VARCHAR(500) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_doctors (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  assigned_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_patient_doctor UNIQUE (patient_id, doctor_id)
);
CREATE INDEX IF NOT EXISTS idx_patient_doctors_patient ON patient_doctors(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_doctors_doctor ON patient_doctors(doctor_id);
