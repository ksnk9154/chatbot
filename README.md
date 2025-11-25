# 🤖 Database Chatbot - Natural Language to SQL Query System

A full-stack chatbot application that allows users to query a PostgreSQL database using natural language, powered by Google Gemini AI.

## 🚀 Features

- **Natural Language Processing**: Ask questions in plain English
- **Database Integration**: Connected to PostgreSQL with e-commerce schema
- **AI-Powered**: Uses Google Gemini AI to convert natural language to SQL
- **Security First**: Read-only queries with comprehensive safety validation
- **Real-time Chat Interface**: Clean, responsive React frontend
- **RESTful API**: Express.js backend with proper error handling

## 📁 Project Structure

```
chatbot/
├── src/                     # React application source
│   ├── App.js              # Main chat component
│   ├── App.css             # Styling
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── public/                 # Static files
│   └── index.html          # HTML template
├── backend/                # Node.js API server
│   ├── routes/
│   │   └── chat.js        # Chat API endpoints
│   ├── utils/
│   │   └── safety.js      # SQL safety validation
│   ├── server.js          # Express server
│   ├── db.js              # PostgreSQL connection
│   ├── setup.js           # Database setup script
│   ├── package.json       # Backend dependencies
│   └── .env               # Environment variables (create from .env.example)
├── build/                 # Production build output
├── node_modules/          # Frontend dependencies
├── package.json           # Root package.json with concurrently setup
├── package-lock.json      # Frontend lockfile
├── .env                   # Frontend environment variables (if needed)
├── .gitignore            # Git ignore rules
├── netlify.toml          # Netlify deployment config
├── README.md             # This file
├── test_chat.js          # Chat functionality tests
├── test_safety.js        # Safety validation tests
└── TODO.md               # Project tasks
```

## 🚀 Deployment on Render

### Prerequisites

- Render account
- PostgreSQL database (Render managed or external)
- Google Gemini API key

### Render Deployment Steps

1. **Connect Repository**: Connect your GitHub repository to Render

2. **Create Web Service**:
   - Choose "Web Service" from Render dashboard
   - Connect your repository
   - Set build command: `npm run build`
   - Set start command: `npm start`

3. **Environment Variables**: Add the following in Render's Environment settings:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   GOOGLE_API_KEY=your_google_gemini_api_key
   MODEL_ID=gemini-2.0-flash
   NODE_ENV=production
   ```

4. **Deploy**: Render will automatically build and deploy your application

## 🛠️ Local Development Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Google Gemini API key

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/ksnk9154/chatbot.git
cd chatbot

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Database Setup

Create a PostgreSQL database and set up the schema using the provided setup script:

```bash
# From the backend directory
cd backend
node setup.js
```

This will create all necessary tables and populate them with sample data. The setup script includes:

- **Tables**: customers, products, orders, order_items
- **Sample Data**: 10 customers, 10 products, 15 orders, 20 order items
- **Relationships**: Proper foreign key constraints between tables

**Manual Setup (Alternative)**

If you prefer to run the SQL manually, create a PostgreSQL database and run the following schema:

```sql
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

-- Insert sample data (10 customers, 10 products, 15 orders, 20 order items)
-- See backend/setup.js for complete INSERT statements
```

### 3. Environment Configuration

In the `backend` directory, copy `.env.example` to `.env`:

```bash
cd backend
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
GOOGLE_API_KEY=your_google_gemini_api_key
MODEL_ID=gemini-2.0-flash
NODE_ENV=development
```

### 4. Start the Application

To start both frontend and backend simultaneously:

```bash
# From project root
npm start
```

This will run:
- Frontend on http://localhost:3000 (React dev server)
- Backend on http://localhost:5000 (Express server)

**Alternative:** If you need to run them separately:

#### Start Backend only:
```bash
cd backend
npm start
```

#### Start Frontend only:
```bash
# From project root
npm run start-frontend
```

## 💬 Usage Examples

Try asking these natural language questions:

### Basic Queries
- "Show all customers"
- "List all products"
- "Display all orders"

### Filtered Queries
- "Show products with price greater than 1000"
- "Find customers from Bangalore"
- "List Electronics products"
- "Show pending orders"

### Complex Queries
- "Find orders for Alice Johnson"
- "Show products that are out of stock"
- "List customers who have placed orders"
- "Show total sales by product category"

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
    "data": [...]
  }
}
```

### GET /api/test
Test backend connectivity (database + AI).

### GET /health
Simple health check endpoint.

## 🛡️ Security Features

- **Read-Only Queries**: Only SELECT statements allowed
- **SQL Injection Protection**: Comprehensive keyword filtering
- **Query Sanitization**: Automatic LIMIT addition
- **Input Validation**: Strict validation of user inputs
- **Error Handling**: Safe error messages without exposing internals

## 🔧 Technical Stack

### Frontend
- **React** - UI framework
- **CSS3** - Styling with modern design
- **Fetch API** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Google Gemini AI** - Natural language processing
- **CORS** - Cross-origin requests

## 🐛 Troubleshooting

### Common Issues

1. **"Connection Error" in frontend**
   - Make sure backend is running on port 5000
   - Check if PostgreSQL is running
   - Verify .env configuration

2. **"Database table not found"**
   - Run the database schema setup SQL
   - Check DATABASE_URL in .env file

3. **"API key not configured"**
   - Add your Google Gemini API key to .env
   - Restart the backend server

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U your_username -d your_database -c "SELECT NOW();"

# Check if tables exist
psql -h localhost -U your_username -d your_database -c "\dt"
```

## 📝 Development

### Adding New Tables

1. Create the table in your PostgreSQL database
2. Update the schema description in `backend/routes/chat.js`
3. Test with natural language queries

### Customizing the UI

- Modify `src/App.css` for styling changes
- Update `src/App.js` for functionality changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Look at existing GitHub issues
3. Create a new issue with detailed information

## 🔄 Updates

- **v1.0.0**: Initial release with basic chatbot functionality
- **v1.1.0**: Added PostgreSQL integration and natural language processing
- **v1.2.0**: Enhanced security features and error handling
- **v1.3.0**: Fixed safety validation to allow legitimate SELECT operations (CAST, UNION, etc.) while maintaining security

---

**Happy Querying! 🚀**