const { isSelectOnly } = require('./backend/utils/safety');

// Test queries
const testQueries = [
  "SELECT * FROM customers",
  "SELECT name, email FROM customers UNION SELECT name, email FROM customers_backup",
  "SELECT CAST(price AS NUMERIC) FROM products",
  "SELECT CONVERT(VARCHAR, order_date, 23) FROM orders",
  "DROP TABLE customers", // Should fail
  "SELECT * FROM customers; DROP TABLE users", // Should fail
];

console.log("Testing isSelectOnly function:");
testQueries.forEach((query, index) => {
  const result = isSelectOnly(query);
  console.log(`${index + 1}. ${result ? '✅ PASS' : '❌ FAIL'}: ${query}`);
});
