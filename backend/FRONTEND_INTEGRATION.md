# Frontend Integration Guide

## Replace your existing handleSendMessage function

Replace your current Gemini API call in your React app with this backend integration:

```javascript
const handleSendMessage = async () => {
  if (input.trim() === '') return;

  const userMessage = { text: input, sender: 'user' };
  setMessages(prev => [...prev, userMessage]);
  const userInput = input;
  setInput('');
  setLoading(true);

  try {
    // Call your backend instead of Gemini directly
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userInput }),
    });

    const data = await response.json();

    if (data.success) {
      // Format the database results nicely
      let botResponse = data.results.message;

      if (data.results.data.length > 0) {
        botResponse += "\n\n📊 Results:\n";

        // Show first few results in a readable format
        data.results.data.slice(0, 5).forEach((row, index) => {
          botResponse += `\n${index + 1}. `;
          Object.entries(row).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              botResponse += `${key}: ${value}, `;
            }
          });
          botResponse = botResponse.slice(0, -2) + "\n"; // Remove last comma
        });

        if (data.results.data.length > 5) {
          botResponse += `\n... and ${data.results.data.length - 5} more results`;
        }

        botResponse += `\n\n🔍 SQL Query: ${data.query}`;
        botResponse += `\n⏱️ Execution Time: ${data.execution_time_ms}ms`;
      }

      const botMessage = { 
        text: botResponse, 
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } else {
      const errorMessage = { 
        text: `❌ Error: ${data.error}`, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  } catch (error) {
    const errorMessage = { 
      text: `🔌 Connection error: ${error.message}\n\nMake sure your backend is running at http://localhost:5000`, 
      sender: 'bot' 
    };
    setMessages(prev => [...prev, errorMessage]);
  }

  setLoading(false);
};
```

## Test Questions for Your Database

Once your backend is running, try these questions in your chatbot:

- "Show all customers"
- "List all products"
- "Find products in Electronics category"
- "Show orders for Alice Johnson"
- "Which products cost more than 5000?"
- "List all pending orders"
- "Show products that are out of stock"
- "Find customer details by email alice@example.com"

## Startup Checklist

1. ✅ PostgreSQL is running and accessible
2. ✅ Database 'mydatabase' exists with the schema
3. ✅ Backend server is running (`npm start` in backend folder)
4. ✅ React app is updated to use the backend API
5. ✅ Test with simple questions like "Show all products"

## Troubleshooting

- **Database connection failed**: Check if PostgreSQL is running and credentials in .env are correct
- **AI API errors**: Verify your Google API key is valid and has Gemini access
- **CORS errors**: Make sure the backend is running on port 5000 and frontend on 3000
- **Empty results**: Check if your database has sample data inserted

Your chatbot now has database superpowers! 🚀
