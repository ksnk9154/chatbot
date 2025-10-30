import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import chatRoute from './routes/chat.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', chatRoute);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'Connected to PostgreSQL',
      time: result.rows[0].now,
      environment: {
        node_version: process.version,
        port: process.env.PORT || 5000,
        database_url: process.env.DATABASE_URL ? 'configured' : 'missing',
        google_api_key: process.env.GOOGLE_API_KEY ? 'configured' : 'missing'
      }
    });
  } catch (error) {
    console.error('DB connection error:', error);
    res.status(500).json({
      error: 'Database connection failed',
      details: error.message,
      troubleshooting: 'Check DATABASE_URL environment variable and database availability'
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log('\x1b[32m%s\x1b[0m', '✅ Connected to Render PostgreSQL database');
});
