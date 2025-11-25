// backend/server.js (ESM version)

import express from 'express';
import pg from 'pg';

const { Pool } = pg;

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const rawDbUrl = process.env.DATABASE_URL || process.env.DB_URL || '';

function maskedConnString(url) {
  if (!url) return '(empty)';
  return url.replace(
    /(\/\/[^:]+:)([^@]+)(@)/,
    (_, a, p, b) => `${a}${'*'.repeat(8)}${b}`
  );
}

console.log('▶ DATABASE_URL present?', !!rawDbUrl);
console.log('▶ DATABASE_URL (masked):', maskedConnString(rawDbUrl));

const pool = new Pool({
  connectionString: rawDbUrl || undefined,
  ssl: rawDbUrl.includes('.render.com') ? { rejectUnauthorized: false } : undefined,
});

async function runDbHealthCheck() {
  if (!rawDbUrl) {
    console.error('✖ No DATABASE_URL provided in environment.');
    return { ok: false, reason: 'no_database_url' };
  }

  try {
    const client = await pool.connect();
    try {
      const info = await client.query(`
        SELECT 
          now() AS now,
          current_database() AS db,
          inet_server_addr() AS server_ip,
          version() AS pg_version;
      `);

      const enc = await client.query(`SHOW client_encoding;`);

      console.log('✅ DB connection OK:', info.rows[0]);
      console.log('🔤 client_encoding:', enc.rows[0].client_encoding);

      return {
        ok: true,
        info: info.rows[0],
        encoding: enc.rows[0].client_encoding,
      };
    } finally {
      client.release();
    }
  } catch (err) {
    const safeErr = String(err).replace(
      /(postgresql:\/\/[^:]+:)([^@]+)(@)/,
      (_, a, p, b) => `${a}${'*'.repeat(8)}${b}`
    );

    console.error('✖ DB connection failed:', safeErr);
    console.error('  - Check SSL (Render external DB requires it)');
    console.error('  - Check password / rotated credentials');
    console.error('  - Check DATABASE_URL is correctly set in Render');

    return { ok: false, error: safeErr };
  }
}

app.get('/health', async (req, res) => {
  const db = await runDbHealthCheck().catch((e) => ({
    ok: false,
    error: e.toString(),
  }));

  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    db,
  });
});

app.post('/api/chat', async (req, res) => {
  res.json({ ok: true, msg: 'chat endpoint placeholder' });
});

app.listen(PORT, HOST, async () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT} (bound to ${HOST})`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);

  const check = await runDbHealthCheck();
  if (!check.ok) {
    console.warn('⚠️ Initial DB check failed — see logs above.');
  }
});
