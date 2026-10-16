const { validateEnv } = require('./config/env');
validateEnv();

const app = require('./app');
const { pool } = require('./config/db');
const port = Number(process.env.PORT || 3000);

async function start() {
  await pool.query('SELECT 1');
  console.log('Connected to PostgreSQL.');
  const server = app.listen(port, () => console.log(`Healthcare API listening on http://localhost:${port}`));
  const shutdown = async () => {
    console.log('Shutting down server...');
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
