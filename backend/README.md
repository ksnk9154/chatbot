# Chatbot Backend with PostgreSQL & Google Gemini AI

A Node.js backend that enables your chatbot to query a PostgreSQL database using natural language, powered by Google Gemini AI.

## 🚀 Features

- **Natural Language to SQL**: Convert user questions to PostgreSQL queries using Gemini AI
- **Database Integration**: Connect to PostgreSQL with connection pooling
- **Security First**: Read-only queries only (SELECT), with comprehensive safety validation
- **E-commerce Schema**: Pre-configured for customers, products, orders, and order_items tables
- **Error Handling**: Comprehensive error handling and logging
- **Health Checks**: Built-in endpoints to test database and AI connectivity

## 📁 Project Structure

```
backend/
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── server.js            # Express server entry point
├── db.js                # PostgreSQL connection setup
├── routes/
│   └── chat.js          # Chat API endpoints
├── utils/
│   └── safety.js        # SQL safety validation
└── README.md            # This file
```

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:1234@localhost:5432/mydatabase
GOOGLE_API_KEY=AIzaSyBnZDSYdrHqV-rF__Dino7Z0GJUFOIw0Wc
MODEL_ID=gemini-2.0-flash
NODE_ENV=development
```

### 3. Database Setup

Make sure your PostgreSQL database has the e-commerce schema:

```sql
-- Create tables
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    price NUMERIC(10,2),
    stock INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    order_date TIMESTAMP DEFAULT NOW(),
    total_amount NUMERIC(10,2),
    status VARCHAR(20)
);

CREATE TABLE order_items (
    item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    product_id INT REFERENCES products(product_id),
    quantity INT,
    subtotal NUMERIC(10,2)
);

-- Insert sample data
INSERT INTO customers (name, email, phone, address) VALUES
('Alice Johnson', 'alice@example.com', '9876543210', 'Bangalore, India'),
('Bob Smith', 'bob@example.com', '9998877665', 'Chennai, India');

INSERT INTO products (name, category, price, stock) VALUES
('Laptop', 'Electronics', 65000.00, 10),
('Headphones', 'Electronics', 2500.00, 50),
('T-Shirt', 'Clothing', 799.00, 100);

INSERT INTO orders (customer_id, total_amount, status) VALUES
(1, 67500.00, 'Delivered'),
(2, 799.00, 'Pending');

INSERT INTO order_items (order_id, product_id, quantity, subtotal) VALUES
(1, 1, 1, 65000.00),
(1, 2, 1, 2500.00),
(2, 3, 1, 799.00);
```

### 4. Start the Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

The server will run on `http://localhost:5000`

## 🔌 API Endpoints

### POST /api/chat

Send natural language questions to query the database.

**Request:**
```json
{
  "message": "Show all products in Electronics category"
}
```

**Response:**
```json
{
  "success": true,
  "query": "SELECT * FROM products WHERE category = 'Electronics' LIMIT 100",
  "execution_time_ms": 45,
  "results": {
    "count": 2,
    "message": "Found 2 result(s).",
    "data": [
      {
        "product_id": 1,
        "name": "Laptop",
        "category": "Electronics",
        "price": "65000.00",
        "stock": 10,
        "created_at": "2025-10-17T06:17:00.000Z"
      }
    ]
  }
}
```

### GET /api/test

Test the backend connectivity (database + AI).

### GET /health

Simple health check endpoint.

## 💬 Example Questions

Try these natural language questions:

- "Show all customers"
- "List products with price greater than 1000"
- "Find orders for Alice Johnson"
- "Show total sales by category"
- "Which products are out of stock?"
- "List all pending orders"

## 🛡️ Security Features

- **Read-Only**: Only SELECT queries allowed
- **SQL Injection Protection**: Comprehensive keyword filtering
- **Query Sanitization**: Automatic LIMIT addition
- **Input Validation**: Strict validation of user inputs
- **Error Handling**: Safe error messages without exposing internals

## 🔧 Frontend Integration

Use this in your React app:

```javascript
async function askChatbot(message) {
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
}

// Usage
askChatbot("Show all products").then(result => {
  console.log(result);
});
```

## 📜 License

MIT License - feel free to use and modify as needed!
