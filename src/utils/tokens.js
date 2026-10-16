const jwt = require('jsonwebtoken');

function createAccessToken(user) {
  return jwt.sign(
    { sub: String(user.id), email: user.email, type: 'access' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m', issuer: 'healthcare-api', audience: 'healthcare-client' }
  );
}
function createRefreshToken(user) {
  return jwt.sign(
    { sub: String(user.id), type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', issuer: 'healthcare-api', audience: 'healthcare-client' }
  );
}
module.exports = { createAccessToken, createRefreshToken };
