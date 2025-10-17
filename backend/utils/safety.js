// safety.js - SQL safety validation for read-only operations

/**
 * Validates if a SQL query is safe (SELECT-only)
 * @param {string} sql - The SQL query to validate
 * @returns {boolean} - True if safe, false otherwise
 */
function isSelectOnly(sql) {
  if (!sql || typeof sql !== 'string') {
    return false;
  }

  // Clean and normalize the SQL
  const cleaned = sql.trim().toLowerCase();

  // Must start with SELECT
  if (!cleaned.startsWith('select')) {
    return false;
  }

  // List of dangerous keywords that should not be present
  const forbiddenKeywords = [
    'insert', 'update', 'delete', 'drop', 'truncate', 'alter',
    'grant', 'revoke', 'commit', 'rollback', 'begin',
    'transaction', 'lock', 'unlock', 'exec', 'execute', 'call',
    'procedure', 'function', 'trigger', 'index', 'view', 'schema',
    'database', 'constraint', 'sequence'
  ];

  // Check for forbidden keywords
  for (const keyword of forbiddenKeywords) {
    if (cleaned.includes(keyword)) {
      return false;
    }
  }

  // Check for SQL injection patterns using regex for precise matching
  const dangerousPatterns = [
    /--/,        // SQL comments
    /\/\*/,      // Block comments start
    /\*\//,      // Block comments end
    /\bxp_/,     // Extended stored procedures (word boundary)
    /\bsp_/,     // System stored procedures (word boundary)
    /@@/,        // Global variables
    /\bchar\(/,  // Character conversion (word boundary)
    /\bwaitfor\b/, // Time delays (word boundary)
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(cleaned)) {
      return false;
    }
  }

  return true;
}

/**
 * Sanitizes a SQL query
 * @param {string} sql - The SQL query to sanitize
 * @returns {string} - The sanitized query
 */
function sanitizeQuery(sql) {
  if (!sql) return '';

  let cleaned = sql.trim();

  return cleaned;
}

module.exports = {
  isSelectOnly,
  sanitizeQuery
};