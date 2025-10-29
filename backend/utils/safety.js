// safety.js - SQL safety validation for read-only operations

/**
 * Validates if a SQL query is safe (SELECT, INSERT, UPDATE, DELETE only)
 * @param {string} sql - The SQL query to validate
 * @returns {boolean} - True if safe, false otherwise
 */
function isSafeQuery(sql) {
  if (!sql || typeof sql !== 'string') {
    return false;
  }

  // Clean and normalize the SQL
  const cleaned = sql.trim().toLowerCase();

  // Must start with SELECT, INSERT, UPDATE, or DELETE
  const allowedStarts = ['select', 'insert', 'update', 'delete'];
  const startsWithAllowed = allowedStarts.some(start => cleaned.startsWith(start));
  if (!startsWithAllowed) {
    return false;
  }

  // List of dangerous keywords that should not be present
  const forbiddenKeywords = [
    'drop', 'truncate', 'alter', 'grant', 'revoke', 'commit', 'rollback', 'begin',
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

  // Additional safety: UPDATE and DELETE must have WHERE clause
  if (cleaned.startsWith('update') || cleaned.startsWith('delete')) {
    if (!cleaned.includes(' where ')) {
      return false; // UPDATE/DELETE without WHERE is too dangerous
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

export { isSafeQuery, sanitizeQuery };
