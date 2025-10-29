import express from 'express';
import db from '../db.js';
import { isSafeQuery, sanitizeQuery } from '../utils/safety.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Gemini AI
const apiKey = process.env.GOOGLE_API_KEY;
const modelId = process.env.MODEL_ID || 'gemini-2.0-flash';

if (!apiKey) {
  console.warn('⚠️  WARNING: GOOGLE_API_KEY not set in .env');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: modelId });

/**
 * Generate SQL query from natural language using Gemini AI
 * @param {string} nlQuestion - Natural language question
 * @returns {string} - Generated SQL query
 */
async function generateSQLFromNL(nlQuestion) {
  const firstWord = nlQuestion.trim().split(' ')[0].toLowerCase();

  let operationType;
  if (['add', 'create', 'insert', 'new', 'make', 'generate'].includes(firstWord)) {
    operationType = 'INSERT';
  } else if (['update', 'change', 'modify'].includes(firstWord)) {
    operationType = 'UPDATE';
  } else if (['delete', 'remove'].includes(firstWord)) {
    operationType = 'DELETE';
  } else {
    operationType = 'SELECT';
  }

  console.log(`Detected operation: ${operationType}`);

  let prompt;
  if (operationType === 'INSERT') {
    prompt = `Generate an INSERT SQL query for: "${nlQuestion}"

Example: For "add new customer", generate INSERT INTO customers (name, email, phone, address) VALUES ('John Doe', 'john@example.com', '1234567890', 'New York, USA');

Database Schema:
- customers: customer_id (SERIAL PRIMARY KEY), name (VARCHAR), email (VARCHAR), phone (VARCHAR), address (TEXT), created_at (TIMESTAMP)
- products: product_id (SERIAL PRIMARY KEY), name (VARCHAR), category (VARCHAR), price (NUMERIC), stock (INT), created_at (TIMESTAMP)
- orders: order_id (SERIAL PRIMARY KEY), customer_id (INT), order_date (TIMESTAMP), total_amount (NUMERIC), status (VARCHAR)
- order_items: item_id (SERIAL PRIMARY KEY), order_id (INT), product_id (INT), quantity (INT), subtotal (NUMERIC)

Use realistic sample values for all required columns (exclude SERIAL PRIMARY KEY and TIMESTAMP).

Return ONLY the INSERT SQL query:`;
  } else if (operationType === 'UPDATE') {
    prompt = `Generate an UPDATE SQL query for: "${nlQuestion}"

Example: For "update customer email", generate UPDATE customers SET email = 'newemail@example.com' WHERE customer_id = 1;

Database Schema:
- customers: customer_id (SERIAL PRIMARY KEY), name (VARCHAR), email (VARCHAR), phone (VARCHAR), address (TEXT), created_at (TIMESTAMP)
- products: product_id (SERIAL PRIMARY KEY), name (VARCHAR), category (VARCHAR), price (NUMERIC), stock (INT), created_at (TIMESTAMP)
- orders: order_id (SERIAL PRIMARY KEY), customer_id (INT), order_date (TIMESTAMP), total_amount (NUMERIC), status (VARCHAR)
- order_items: item_id (SERIAL PRIMARY KEY), order_id (INT), product_id (INT), quantity (INT), subtotal (NUMERIC)

Include a WHERE condition to avoid affecting all records.

Return ONLY the UPDATE SQL query:`;
  } else if (operationType === 'DELETE') {
    prompt = `Generate a DELETE SQL query for: "${nlQuestion}"

Example: For "delete customer", generate DELETE FROM customers WHERE customer_id = 1;

Database Schema:
- customers: customer_id (SERIAL PRIMARY KEY), name (VARCHAR), email (VARCHAR), phone (VARCHAR), address (TEXT), created_at (TIMESTAMP)
- products: product_id (SERIAL PRIMARY KEY), name (VARCHAR), category (VARCHAR), price (NUMERIC), stock (INT), created_at (TIMESTAMP)
- orders: order_id (SERIAL PRIMARY KEY), customer_id (INT), order_date (TIMESTAMP), total_amount (NUMERIC), status (VARCHAR)
- order_items: item_id (SERIAL PRIMARY KEY), order_id (INT), product_id (INT), quantity (INT), subtotal (NUMERIC)

Include a WHERE condition to avoid affecting all records.

Return ONLY the DELETE SQL query:`;
  } else {
    prompt = `Generate a SELECT SQL query for: "${nlQuestion}"

Example: For "show all customers", generate SELECT * FROM customers;

Database Schema:
- customers: customer_id (SERIAL PRIMARY KEY), name (VARCHAR), email (VARCHAR), phone (VARCHAR), address (TEXT), created_at (TIMESTAMP)
- products: product_id (SERIAL PRIMARY KEY), name (VARCHAR), category (VARCHAR), price (NUMERIC), stock (INT), created_at (TIMESTAMP)
- orders: order_id (SERIAL PRIMARY KEY), customer_id (INT), order_date (TIMESTAMP), total_amount (NUMERIC), status (VARCHAR)
- order_items: item_id (SERIAL PRIMARY KEY), order_id (INT), product_id (INT), quantity (INT), subtotal (NUMERIC)

Return ONLY the SELECT SQL query:`;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let sql = response.text().trim();

    // Clean up any markdown formatting
    sql = sql.replace(/```sql\n?/g, '').replace(/```\n?/g, '').replace(/^sql\n?/g, '').trim();

    return sql;
  } catch (error) {
    console.error('Error generating SQL:', error);
    throw new Error('Failed to generate SQL query');
  }
}

/**
 * Format query results for better readability
 * @param {Array} rows - Database query results
 * @returns {Object} - Formatted response
 */
function formatResults(rows) {
  if (!rows || rows.length === 0) {
    return {
      count: 0,
      message: "No results found.",
      data: []
    };
  }

  return {
    count: rows.length,
    message: `Found ${rows.length} result(s).`,
    data: rows
  };
}

// POST /api/chat - Main chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
        example: '{"message": "Show all products"}'
      });
    }

    console.log(`💬 User question: ${message}`);

    // Generate SQL from natural language
    const rawSQL = await generateSQLFromNL(message);
    console.log(`🤖 Generated SQL: ${rawSQL}`);

    // Normalize SQL to single line for safety validation
    const normalizedSQL = rawSQL.replace(/\s+/g, ' ').trim().replace(/;$/, '');
    console.log(`🔧 Normalized SQL: ${normalizedSQL}`);

    // Safety validation
    if (!isSafeQuery(normalizedSQL)) {
      return res.status(400).json({
        success: false,
        error: 'Generated query failed safety validation. Only SELECT, INSERT, UPDATE, DELETE queries are allowed.',
        generated_sql: rawSQL,
        reason: 'Query contains potentially dangerous operations'
      });
    }

    // Sanitize the query
    const sanitizedSQL = sanitizeQuery(rawSQL);
    console.log(`🔒 Sanitized SQL: ${sanitizedSQL}`);

    // Execute the query
    const startTime = Date.now();
    const { rows } = await db.query(sanitizedSQL);
    const executionTime = Date.now() - startTime;

    console.log(`✅ Query executed successfully in ${executionTime}ms, returned ${rows.length} rows`);

    // Format and return results
    const formattedResults = formatResults(rows);

    res.json({
      success: true,
      query: sanitizedSQL,
      execution_time_ms: executionTime,
      results: formattedResults
    });

  } catch (error) {
    console.error('❌ Error in /api/chat:', error);

    // Return appropriate error response with success: false
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      res.status(400).json({
        success: false,
        error: 'Database table not found. Please check if your database schema is set up correctly.',
        details: error.message
      });
    } else if (error.message.includes('syntax error')) {
      res.status(400).json({
        success: false,
        error: 'Generated SQL has syntax errors.',
        details: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// GET /api/test - Test endpoint
router.get('/test', async (req, res) => {
  try {
    // Test database connection
    const { rows } = await db.query('SELECT NOW() as current_time, version() as pg_version');

    res.json({
      success: true,
      message: 'Backend is working correctly!',
      database: {
        connected: true,
        current_time: rows[0].current_time,
        version: rows[0].pg_version
      },
      ai: {
        model: modelId,
        api_key_configured: !!apiKey
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
