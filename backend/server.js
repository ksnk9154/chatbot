const express = require('express');
const cors = require('cors');
require('dotenv').config();

const chatRoute = require('./routes/chat');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', chatRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chatbot backend is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
});