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
    'create', 'grant', 'revoke', 'commit', 'rollback', 'begin',
    'transaction', 'lock', 'unlock', 'exec', 'execute', 'call',
    'procedure', 'function', 'trigger', 'index', 'view', 'schema',
    'database', 'table', 'column', 'constraint', 'sequence'
  ];

  // Check for forbidden keywords
  for (const keyword of forbiddenKeywords) {
    if (cleaned.includes(keyword)) {
      return false;
    }
  }

  // Check for SQL injection patterns
  const dangerousPatterns = [
    ';',           // Multiple statements
    '--',          // SQL comments
    '/*',          // Block comments
    '*/',          // Block comments
    'xp_',         // Extended stored procedures
    'sp_',         // System stored procedures
    '@@',          // Global variables
    'char(',       // Character conversion
    'cast(',       // Type casting (can be dangerous)
    'convert(',    // Type conversion
    'union',       // Union attacks
    'waitfor'      // Time delays
  ];

  for (const pattern of dangerousPatterns) {
    if (cleaned.includes(pattern)) {
      return false;
    }
  }

  return true;
}

/**
 * Sanitizes and limits a SQL query
 * @param {string} sql - The SQL query to sanitize
 * @returns {string} - The sanitized query
 */
function sanitizeQuery(sql) {
  if (!sql) return '';

  let cleaned = sql.trim();

  // Add LIMIT if not present and it's a SELECT
  if (cleaned.toLowerCase().startsWith('select') && 
      !cleaned.toLowerCase().includes('limit')) {
    cleaned += ' LIMIT 100';
  }

  return cleaned;
}

module.exports = {
  isSelectOnly,
  sanitizeQuery
};