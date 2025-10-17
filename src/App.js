import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';

const genAI = new GoogleGenerativeAI('AIzaSyBnZDSYdrHqV-rF__Dino7Z0GJUFOIw0Wc');

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(input);
      const response = await result.response;
      const answer = response.text();
      const botMessage = { text: answer, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = { text: `Error: ${error.message || 'Unable to fetch answer. Please check your API key and try again.'}`, sender: 'bot' };
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
          <h1>Free Chatbot Q&A</h1>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
          {loading && <div className="message bot"><div className="message-text">Thinking...</div></div>}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
