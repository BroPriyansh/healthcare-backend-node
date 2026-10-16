function notFound(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} was not found.` } });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  console.error(err);
  if (err.code === '23505') {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'A record with that unique value already exists.' } });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: { code: 'INVALID_REFERENCE', message: 'One or more referenced records do not exist.' } });
  }
  const status = Number.isInteger(err.status) ? err.status : 500;
  const message = status >= 500 ? 'An unexpected server error occurred.' : err.message;
  res.status(status).json({ error: { code: err.codeName || 'SERVER_ERROR', message } });
}
module.exports = { notFound, errorHandler };
