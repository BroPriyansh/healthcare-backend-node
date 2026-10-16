const jwt = require('jsonwebtoken');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Provide a valid Bearer access token.' } });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: 'healthcare-api', audience: 'healthcare-client'
    });
  } catch {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Access token is invalid or expired.' } });
  }
  if (payload.type !== 'access') {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN_TYPE', message: 'Use an access token for this endpoint.' } });
  }
  const result = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [payload.sub]);
  if (!result.rowCount) {
    return res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'The account associated with this token no longer exists.' } });
  }
  req.user = result.rows[0];
  next();
});
module.exports = { authenticate };
