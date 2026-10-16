const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { createAccessToken, createRefreshToken } = require('../utils/tokens');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await db.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
    [name, email, passwordHash]
  );
  const user = result.rows[0];
  res.status(201).json({ message: 'User registered successfully.', user });
});

const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = req.body.password;
  if (!email || typeof password !== 'string') {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' } });
  }
  const result = await db.query('SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' } });
  }
  delete user.password_hash;
  res.json({
    message: 'Login successful.',
    user,
    tokens: { access: createAccessToken(user), refresh: createRefreshToken(user), token_type: 'Bearer' }
  });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.body.refresh;
  if (!token) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Refresh token is required.' } });
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET, { issuer: 'healthcare-api', audience: 'healthcare-client' });
  } catch {
    return res.status(401).json({ error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid or expired.' } });
  }
  if (payload.type !== 'refresh') {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN_TYPE', message: 'A refresh token is required.' } });
  }
  const result = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [payload.sub]);
  if (!result.rowCount) return res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'Account no longer exists.' } });
  res.json({ tokens: { access: createAccessToken(result.rows[0]), refresh: createRefreshToken(result.rows[0]), token_type: 'Bearer' } });
});

module.exports = { register, login, refresh };
