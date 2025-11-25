const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// --- DB config & helpers ---
const rawDbUrl = process.env.DATABASE_URL || process.env.DB_URL || '';
function maskedConnString(url) {
  if (!url) return '(empty)';
  // hide password between ':' and '@' for typical postgres URL
  return url.replace(/(\/\/[^:]+:)([^@]+)(@)/, (_, a, p, b) => `${a}${'*'.repeat(8)}${b}`);
}

console.log('▶ DATABASE_URL present?', !!rawDbUrl);
console.log('▶ DATABASE_URL (masked):', maskedConnString(rawDbUrl));

const pool = new Pool({
  connectionString: rawDbUrl || undefined,
  // Many managed DBs require SSL; the safest default for external is to require TLS but accept the CA-less connection.
  // If you're inside Render using the internal host, you can remove ssl or set to false.
  ssl: rawDbUrl && rawDbUrl.includes('.render.com') ? { rejectUnauthorized: false } : undefined,
  // optional: connectionTimeoutMillis: 5000
});

async function runDbHealthCheck() {
  if (!rawDbUrl) {
    console.error('✖ No DATABASE_URL provided in environment. Skipping DB check.');
    return { ok: false, reason: 'no_database_url' };
  }

  try {
    const client = await pool.connect();
    try {
      // useful quick diagnostics
      const rows = await client.query(`
        SELECT 
          now() AS now, 
          current_database() AS db, 
          inet_server_addr() AS server_ip, 
          version() AS pg_version;
      `);
      const encRes = await client.query(`SHOW client_encoding;`);
      console.log('✅ DB connection OK:', rows.rows[0]);
      console.log('🔤 client_encoding:', encRes.rows[0].client_encoding);
      return { ok: true, info: rows.rows[0], encoding: encRes.rows[0].client_encoding };
    } finally {
      client.release();
    }
  } catch (err) {
    // verbose but helpful errors (mask any url in message)
    const safeErr = String(err).replace(/(postgresql:\/\/[^:]+:)([^@]+)(@)/, (_, a, p, b) => `${a}${'*'.repeat(8)}${b}`);
    console.error('✖ DB connection failed:', safeErr);
    // additional helpful info that commonly causes issues:
    console.error('  - Is the DB host reachable? (DNS, firewall, VPC rules)');
    console.error('  - Is SSL required? Try adding ?sslmode=require or ssl:{rejectUnauthorized:false}');
    return { ok: false, error: err };
  }
}

// --- Routes ---
app.get('/health', async (req, res) => {
  const db = await runDbHealthCheck().catch(e => ({ ok: false, error: e }));
  res.json({ status: 'ok', time: new Date().toISOString(), db });
});

app.post('/api/chat', (req, res) => {
  // keep your chat implementation here
  res.json({ ok: true, msg: 'chat endpoint placeholder' });
});

// --- Start server and run initial DB check ---
app.listen(PORT, HOST, async () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT} (bound to ${HOST})`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  try {
    const check = await runDbHealthCheck();
    if (!check.ok) {
      console.warn('⚠️ Initial DB check failed — check logs and env configuration.');
    }
  } catch (e) {
    console.error('Unexpected error during DB health check:', e);
  }
});
