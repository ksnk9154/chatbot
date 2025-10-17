import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call the backend API instead of Gemini directly
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (data.success) {
        let botResponse = `Found ${data.results.count} result(s).\n\n`;

        if (data.results.count > 0) {
          // Format the results nicely
          const results = data.results.data;
          if (results.length > 0) {
            // Create a formatted table-like response
            const keys = Object.keys(results[0]);
            botResponse += keys.join(' | ') + '\n';
            botResponse += keys.map(() => '---').join(' | ') + '\n';

            results.forEach(row => {
              botResponse += keys.map(key => row[key] || 'N/A').join(' | ') + '\n';
            });
          }
        } else {
          botResponse = "No results found for your query.";
        }

        const botMessage = { text: botResponse, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = { 
          text: `Error: ${data.error || 'Unable to process your request. Please try again.'}`, 
          sender: 'bot' 
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = { 
        text: `Connection Error: Unable to connect to the backend server. Make sure the backend is running on http://localhost:5000`, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <h1>Database Chatbot Q&A</h1>
          <p>Ask questions about customers, products, orders, and more!</p>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>👋 Welcome! Ask me questions like:</p>
              <ul>
                <li>"Show all customers"</li>
                <li>"List products with price greater than 1000"</li>
                <li>"Find orders for Alice Johnson"</li>
                <li>"Which products are out of stock?"</li>
              </ul>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-text">
                {msg.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
          {loading && <div className="message bot"><div className="message-text">🔍 Searching database...</div></div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your database (e.g., 'Show all products')"
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;