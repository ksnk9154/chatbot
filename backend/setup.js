const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const setupSQL = `
-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Customers table
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP
);

-- Products table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    price NUMERIC(10,2),
    stock INT,
    created_at TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    order_date TIMESTAMP,
    total_amount NUMERIC(10,2),
    status VARCHAR(50)
);

-- Order_Items table
CREATE TABLE order_items (
    item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    product_id INT REFERENCES products(product_id),
    quantity INT,
    subtotal NUMERIC(10,2)
);

-- Customers dummy data
INSERT INTO customers (name, email, phone, address, created_at) VALUES
('Alice Johnson', 'alice@example.com', '9876543210', 'Bangalore, India', '2025-10-17 08:32:47'),
('Bob Smith', 'bob@example.com', '9998877665', 'Chennai, India', '2025-10-17 08:32:47'),
('Carol Davis', 'carol@example.com', '9123456789', 'Mumbai, India', '2025-10-17 08:32:47'),
('David Lee', 'david@example.com', '9988776655', 'Hyderabad, India', '2025-10-17 08:33:00'),
('Emma Wilson', 'emma@example.com', '9871234567', 'Pune, India', '2025-10-17 08:33:05'),
('Frank Miller', 'frank@example.com', '9765432109', 'Delhi, India', '2025-10-17 08:33:10'),
('Grace Taylor', 'grace@example.com', '9812345678', 'Kolkata, India', '2025-10-17 08:33:15'),
('Henry Brown', 'henry@example.com', '9898765432', 'Jaipur, India', '2025-10-17 08:33:20'),
('Irene Thomas', 'irene@example.com', '9876541230', 'Lucknow, India', '2025-10-17 08:33:25'),
('Jack White', 'jack@example.com', '9800123456', 'Chandigarh, India', '2025-10-17 08:33:30');

-- Products dummy data
INSERT INTO products (name, category, price, stock, created_at) VALUES
('Laptop', 'Electronics', 65000.00, 10, '2025-10-17 08:32:47'),
('Headphones', 'Electronics', 2500.00, 50, '2025-10-17 08:32:47'),
('Mouse', 'Electronics', 800.00, 100, '2025-10-17 08:32:47'),
('Smartphone', 'Electronics', 25000.00, 25, '2025-10-17 08:32:47'),
('Jeans', 'Clothing', 1999.00, 75, '2025-10-17 08:32:47'),
('T-Shirt', 'Clothing', 499.00, 0, '2025-10-17 08:32:47'),
('Jacket', 'Clothing', 3500.00, 20, '2025-10-17 08:32:47'),
('Blender', 'Home', 3000.00, 15, '2025-10-17 08:32:47'),
('Coffee Maker', 'Home', 4500.00, 5, '2025-10-17 08:32:47'),
('Desk Lamp', 'Home', 1200.00, 30, '2025-10-17 08:32:47');

-- Orders dummy data
INSERT INTO orders (customer_id, order_date, total_amount, status) VALUES
(1, '2025-10-17 08:32:47', 67500.00, 'Delivered'),
(2, '2025-10-17 08:32:47', 799.00, 'Pending'),
(3, '2025-10-17 08:32:47', 27999.00, 'Processing'),
(4, '2025-10-17 08:33:00', 65000.00, 'Delivered'),
(5, '2025-10-17 08:33:05', 2500.00, 'Pending'),
(6, '2025-10-17 08:33:10', 1200.00, 'Delivered'),
(7, '2025-10-17 08:33:15', 3500.00, 'Processing'),
(8, '2025-10-17 08:33:20', 4500.00, 'Pending'),
(9, '2025-10-17 08:33:25', 1999.00, 'Delivered'),
(10, '2025-10-17 08:33:30', 3000.00, 'Delivered'),
(1, '2025-10-17 08:34:00', 799.00, 'Pending'),
(2, '2025-10-17 08:34:05', 1200.00, 'Processing'),
(3, '2025-10-17 08:34:10', 3500.00, 'Delivered'),
(4, '2025-10-17 08:34:15', 4500.00, 'Delivered'),
(5, '2025-10-17 08:34:20', 65000.00, 'Pending');

-- Order_Items dummy data
INSERT INTO order_items (order_id, product_id, quantity, subtotal) VALUES
(1, 1, 1, 65000.00),
(1, 2, 1, 2500.00),
(2, 3, 1, 799.00),
(3, 4, 1, 25000.00),
(3, 5, 1, 2799.00),
(4, 1, 1, 65000.00),
(5, 2, 1, 2500.00),
(6, 10, 1, 1200.00),
(7, 7, 1, 3500.00),
(8, 9, 1, 4500.00),
(9, 5, 1, 1999.00),
(10, 8, 1, 3000.00),
(11, 3, 1, 799.00),
(12, 10, 1, 1200.00),
(13, 7, 1, 3500.00),
(14, 9, 1, 4500.00),
(15, 1, 1, 65000.00),
(15, 4, 1, 0.00),
(6, 6, 2, 499.00),
(8, 3, 1, 799.00);
`;

async function setupDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');

    await client.query(setupSQL);
    console.log('Database setup completed successfully');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

setupDatabase();
