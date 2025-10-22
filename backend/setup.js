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
('Jack White', 'jack@example.com', '9800123456', 'Chandigarh, India', '2025-10-17 08:33:30'),
('Kevin Garcia', 'kevin@example.com', '9876543211', 'Ahmedabad, India', '2025-10-17 08:33:35'),
('Laura Martinez', 'laura@example.com', '9998877666', 'Surat, India', '2025-10-17 08:33:40'),
('Michael Rodriguez', 'michael@example.com', '9123456790', 'Vadodara, India', '2025-10-17 08:33:45'),
('Nancy Lopez', 'nancy@example.com', '9988776656', 'Rajkot, India', '2025-10-17 08:33:50'),
('Oliver Gonzalez', 'oliver@example.com', '9871234568', 'Bikaner, India', '2025-10-17 08:33:55'),
('Patricia Hernandez', 'patricia@example.com', '9765432110', 'Jodhpur, India', '2025-10-17 08:34:00'),
('Quinn Wilson', 'quinn@example.com', '9812345679', 'Udaipur, India', '2025-10-17 08:34:05'),
('Rachel Moore', 'rachel@example.com', '9898765433', 'Ajmer, India', '2025-10-17 08:34:10'),
('Steven Taylor', 'steven@example.com', '9876541231', 'Kota, India', '2025-10-17 08:34:15'),
('Tina Anderson', 'tina@example.com', '9800123457', 'Alwar, India', '2025-10-17 08:34:20'),
('Ursula Thomas', 'ursula@example.com', '9876543212', 'Bhilwara, India', '2025-10-17 08:34:25'),
('Victor Jackson', 'victor@example.com', '9998877667', 'Bharatpur, India', '2025-10-17 08:34:30'),
('Wendy White', 'wendy@example.com', '9123456791', 'Sikar, India', '2025-10-17 08:34:35'),
('Xavier Harris', 'xavier@example.com', '9988776657', 'Tonk, India', '2025-10-17 08:34:40'),
('Yasmine Clark', 'yasmine@example.com', '9871234569', 'Dausa, India', '2025-10-17 08:34:45'),
('Zachary Lewis', 'zachary@example.com', '9765432111', 'Hindaun, India', '2025-10-17 08:34:50'),
('Aaron Walker', 'aaron@example.com', '9812345680', 'Gangapur, India', '2025-10-17 08:34:55'),
('Bella Hall', 'bella@example.com', '9898765434', 'Sawai Madhopur, India', '2025-10-17 08:35:00'),
('Caleb Young', 'caleb@example.com', '9876541232', 'Chittorgarh, India', '2025-10-17 08:35:05'),
('Diana King', 'diana@example.com', '9800123458', 'Nimbahera, India', '2025-10-17 08:35:10'),
('Ethan Wright', 'ethan@example.com', '9876543213', 'Neemuch, India', '2025-10-17 08:35:15'),
('Fiona Lopez', 'fiona@example.com', '9998877668', 'Mandsaur, India', '2025-10-17 08:35:20'),
('Gabriel Hill', 'gabriel@example.com', '9123456792', 'Ratlam, India', '2025-10-17 08:35:25'),
('Hannah Scott', 'hannah@example.com', '9988776658', 'Ujjain, India', '2025-10-17 08:35:30'),
('Ian Green', 'ian@example.com', '9871234570', 'Dewas, India', '2025-10-17 08:35:35'),
('Julia Adams', 'julia@example.com', '9765432112', 'Shajapur, India', '2025-10-17 08:35:40'),
('Kyle Baker', 'kyle@example.com', '9812345681', 'Sehore, India', '2025-10-17 08:35:45'),
('Luna Gonzalez', 'luna@example.com', '9898765435', 'Raisen, India', '2025-10-17 08:35:50'),
('Mason Nelson', 'mason@example.com', '9876541233', 'Betul, India', '2025-10-17 08:35:55'),
('Nora Carter', 'nora@example.com', '9800123459', 'Harda, India', '2025-10-17 08:36:00'),
('Owen Mitchell', 'owen@example.com', '9876543214', 'Hoshangabad, India', '2025-10-17 08:36:05'),
('Piper Perez', 'piper@example.com', '9998877669', 'Itarsi, India', '2025-10-17 08:36:10'),
('Quincy Roberts', 'quincy@example.com', '9123456793', 'Seoni, India', '2025-10-17 08:36:15'),
('Riley Turner', 'riley@example.com', '9988776659', 'Chhindwara, India', '2025-10-17 08:36:20'),
('Sophie Phillips', 'sophie@example.com', '9871234571', 'Balaghat, India', '2025-10-17 08:36:25'),
('Theo Campbell', 'theo@example.com', '9765432113', 'Jabalpur, India', '2025-10-17 08:36:30'),
('Uma Parker', 'uma@example.com', '9812345682', 'Katni, India', '2025-10-17 08:36:35'),
('Violet Evans', 'violet@example.com', '9898765436', 'Rewa, India', '2025-10-17 08:36:40'),
('William Edwards', 'william@example.com', '9876541234', 'Satna, India', '2025-10-17 08:36:45'),
('Xena Collins', 'xena@example.com', '9800123460', 'Sidhi, India', '2025-10-17 08:36:50'),
('Yusuf Stewart', 'yusuf@example.com', '9876543215', 'Singrauli, India', '2025-10-17 08:36:55'),
('Zara Sanchez', 'zara@example.com', '9998877670', 'Shahdol, India', '2025-10-17 08:37:00'),
('Adrian Morris', 'adrian@example.com', '9123456794', 'Umaria, India', '2025-10-17 08:37:05'),
('Brooke Rogers', 'brooke@example.com', '9988776660', 'Dindori, India', '2025-10-17 08:37:10'),
('Carter Reed', 'carter@example.com', '9871234572', 'Anuppur, India', '2025-10-17 08:37:15'),
('Delilah Cook', 'delilah@example.com', '9765432114', 'Burhanpur, India', '2025-10-17 08:37:20'),
('Elliot Morgan', 'elliot@example.com', '9812345683', 'Khandwa, India', '2025-10-17 08:37:25'),
('Faith Bell', 'faith@example.com', '9898765437', 'Khargone, India', '2025-10-17 08:37:30'),
('Gavin Murphy', 'gavin@example.com', '9876541235', 'Barwani, India', '2025-10-17 08:37:35'),
('Harper Bailey', 'harper@example.com', '9800123461', 'Sendhwa, India', '2025-10-17 08:37:40'),
('Isaac Rivera', 'isaac@example.com', '9876543216', 'Shajapur, India', '2025-10-17 08:37:45'),
('Jasmine Cooper', 'jasmine@example.com', '9998877671', 'Ujjain, India', '2025-10-17 08:37:50'),
('Kaden Richardson', 'kaden@example.com', '9123456795', 'Dewas, India', '2025-10-17 08:37:55'),
('Lily Cox', 'lily@example.com', '9988776661', 'Indore, India', '2025-10-17 08:38:00'),
('Miles Howard', 'miles@example.com', '9871234573', 'Bhopal, India', '2025-10-17 08:38:05'),
('Naomi Ward', 'naomi@example.com', '9765432115', 'Vidisha, India', '2025-10-17 08:38:10'),
('Oscar Torres', 'oscar@example.com', '9812345684', 'Raisen, India', '2025-10-17 08:38:15'),
('Penelope Peterson', 'penelope@example.com', '9898765438', 'Rajgarh, India', '2025-10-17 08:38:20'),
('Quinn Gray', 'quinn2@example.com', '9876541236', 'Shajapur, India', '2025-10-17 08:38:25'),
('Ryan Ramirez', 'ryan@example.com', '9800123462', 'Sehore, India', '2025-10-17 08:38:30'),
('Samantha James', 'samantha@example.com', '9876543217', 'Harda, India', '2025-10-17 08:38:35'),
('Tyler Watson', 'tyler@example.com', '9998877672', 'Betul, India', '2025-10-17 08:38:40');

-- Products dummy data
INSERT INTO products (name, category, price, stock, created_at) VALUES
('Laptop', 'Electronics', 65000.00, 10, '2025-10-17 08:32:47'),
('Headphones', 'Electronics', 2500.00, 50, '2025-10-17 08:32:47'),
('Mouse', 'Electronics', 800.00, 100, '2025-10-17 08:32:47'),
('Smartphone', 'Electronics', 25000.00, 25, '2025-10-17 08:32:47'),
('Tablet', 'Electronics', 35000.00, 15, '2025-10-17 08:32:47'),
('Smartwatch', 'Electronics', 15000.00, 30, '2025-10-17 08:32:47'),
('Wireless Earbuds', 'Electronics', 5000.00, 40, '2025-10-17 08:32:47'),
('Gaming Mouse', 'Electronics', 2500.00, 25, '2025-10-17 08:32:47'),
('External Hard Drive', 'Electronics', 8000.00, 20, '2025-10-17 08:32:47'),
('Webcam', 'Electronics', 3000.00, 35, '2025-10-17 08:32:47'),
('Jeans', 'Clothing', 1999.00, 75, '2025-10-17 08:32:47'),
('T-Shirt', 'Clothing', 499.00, 0, '2025-10-17 08:32:47'),
('Jacket', 'Clothing', 3500.00, 20, '2025-10-17 08:32:47'),
('Sneakers', 'Clothing', 4500.00, 45, '2025-10-17 08:32:47'),
('Dress', 'Clothing', 2999.00, 30, '2025-10-17 08:32:47'),
('Sweater', 'Clothing', 2499.00, 40, '2025-10-17 08:32:47'),
('Shorts', 'Clothing', 1299.00, 60, '2025-10-17 08:32:47'),
('Hat', 'Clothing', 799.00, 80, '2025-10-17 08:32:47'),
('Socks', 'Clothing', 299.00, 100, '2025-10-17 08:32:47'),
('Belt', 'Clothing', 999.00, 50, '2025-10-17 08:32:47'),
('Blender', 'Home', 3000.00, 15, '2025-10-17 08:32:47'),
('Coffee Maker', 'Home', 4500.00, 5, '2025-10-17 08:32:47'),
('Desk Lamp', 'Home', 1200.00, 30, '2025-10-17 08:32:47'),
('Microwave', 'Home', 8000.00, 10, '2025-10-17 08:32:47'),
('Toaster', 'Home', 2000.00, 25, '2025-10-17 08:32:47'),
('Vacuum Cleaner', 'Home', 12000.00, 8, '2025-10-17 08:32:47'),
('Air Fryer', 'Home', 6000.00, 12, '2025-10-17 08:32:47'),
('Rice Cooker', 'Home', 3500.00, 18, '2025-10-17 08:32:47'),
('Electric Kettle', 'Home', 1500.00, 40, '2025-10-17 08:32:47'),
('Washing Machine', 'Home', 25000.00, 5, '2025-10-17 08:32:47'),
('Refrigerator', 'Home', 35000.00, 3, '2025-10-17 08:32:47'),
('Bookshelf', 'Furniture', 5000.00, 15, '2025-10-17 08:32:47'),
('Office Chair', 'Furniture', 8000.00, 12, '2025-10-17 08:32:47'),
('Dining Table', 'Furniture', 15000.00, 8, '2025-10-17 08:32:47'),
('Bed Frame', 'Furniture', 20000.00, 6, '2025-10-17 08:32:47'),
('Sofa', 'Furniture', 45000.00, 4, '2025-10-17 08:32:47'),
('Wardrobe', 'Furniture', 25000.00, 7, '2025-10-17 08:32:47'),
('Study Desk', 'Furniture', 6000.00, 20, '2025-10-17 08:32:47'),
('Books', 'Books', 500.00, 200, '2025-10-17 08:32:47'),
('Notebook', 'Stationery', 100.00, 300, '2025-10-17 08:32:47'),
('Pen', 'Stationery', 50.00, 500, '2025-10-17 08:32:47'),
('Backpack', 'Accessories', 2500.00, 25, '2025-10-17 08:32:47'),
('Sunglasses', 'Accessories', 1500.00, 40, '2025-10-17 08:32:47'),
('Watch', 'Accessories', 5000.00, 20, '2025-10-17 08:32:47'),
('Wallet', 'Accessories', 800.00, 60, '2025-10-17 08:32:47'),
('Perfume', 'Beauty', 2000.00, 30, '2025-10-17 08:32:47'),
('Shampoo', 'Beauty', 300.00, 80, '2025-10-17 08:32:47'),
('Face Cream', 'Beauty', 800.00, 50, '2025-10-17 08:32:47'),
('Lipstick', 'Beauty', 400.00, 70, '2025-10-17 08:32:47'),
('Nail Polish', 'Beauty', 200.00, 90, '2025-10-17 08:32:47'),
('Hair Dryer', 'Beauty', 2500.00, 15, '2025-10-17 08:32:47'),
('Dumbbells', 'Sports', 3000.00, 20, '2025-10-17 08:32:47'),
('Yoga Mat', 'Sports', 1200.00, 35, '2025-10-17 08:32:47'),
('Basketball', 'Sports', 1500.00, 25, '2025-10-17 08:32:47'),
('Tennis Racket', 'Sports', 4000.00, 15, '2025-10-17 08:32:47'),
('Cycling Helmet', 'Sports', 2000.00, 20, '2025-10-17 08:32:47'),
('Swimming Goggles', 'Sports', 500.00, 40, '2025-10-17 08:32:47'),
('Protein Powder', 'Health', 2500.00, 30, '2025-10-17 08:32:47'),
('Vitamins', 'Health', 800.00, 60, '2025-10-17 08:32:47'),
('First Aid Kit', 'Health', 600.00, 45, '2025-10-17 08:32:47'),
('Blood Pressure Monitor', 'Health', 3000.00, 10, '2025-10-17 08:32:47'),
('Thermometer', 'Health', 300.00, 50, '2025-10-17 08:32:47'),
('Massage Gun', 'Health', 5000.00, 8, '2025-10-17 08:32:47'),
('Board Game', 'Toys', 800.00, 40, '2025-10-17 08:32:47'),
('Puzzle', 'Toys', 400.00, 60, '2025-10-17 08:32:47'),
('Action Figure', 'Toys', 600.00, 50, '2025-10-17 08:32:47'),
('Building Blocks', 'Toys', 1200.00, 25, '2025-10-17 08:32:47'),
('Stuffed Animal', 'Toys', 800.00, 35, '2025-10-17 08:32:47'),
('Remote Control Car', 'Toys', 2500.00, 15, '2025-10-17 08:32:47');

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
