import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
    const messageToSend = input.trim();
    setInput('');
    setLoading(true);

    try {
      // Call the backend API instead of Gemini directly
      const requestBody = { message: messageToSend };

      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

        if (data.success) {
          const results = data.results.data;
          const count = data.results.count;

          if (count > 0 && results.length > 0) {
            // Check if data is suitable for charts (e.g., has numerical values)
            const keys = Object.keys(results[0]);
            const hasNumbers = keys.some(key => typeof results[0][key] === 'number');

            // Determine chart type based on data characteristics
            let chartType = null;
            let chartData = null;

            if (hasNumbers) {
              // Check if this looks like categorical data (few unique values in a text column)
              const textColumns = keys.filter(key => typeof results[0][key] === 'string');
              const isCategorical = textColumns.some(col => {
                const uniqueValues = new Set(results.map(row => row[col])).size;
                return uniqueValues <= 5 && uniqueValues < results.length * 0.3; // Very strict: less than 5 unique values and less than 30% unique
              });

              if (isCategorical && textColumns.length > 0 && results.length > 5) {
                // Use pie chart only for truly categorical data with many rows
                const categoryCol = textColumns.find(col => col.toLowerCase().includes('category')) || textColumns[0]; // Prefer 'category' column
                const valueCol = keys.find(key => key.toLowerCase().includes('price') || key.toLowerCase().includes('stock')) || keys.find(key => typeof results[0][key] === 'number'); // Prefer price/stock

                if (valueCol) {
                  const aggregatedData = {};
                  results.forEach(row => {
                    const category = row[categoryCol] || 'Other';
                    aggregatedData[category] = (aggregatedData[category] || 0) + (row[valueCol] || 0);
                  });

                  chartData = Object.entries(aggregatedData).map(([name, value]) => ({ name, value }));
                  chartType = 'pie';
                }
              } else {
                // Use bar chart for general numerical data
                chartData = results.map((row, index) => {
                  const name = row.name || row.category || `Row ${index + 1}`;
                  const chartRow = { name };
                  // Include numeric columns and string columns that contain numbers
                  keys.forEach(key => {
                    if (typeof results[0][key] === 'number') {
                      chartRow[key] = row[key];
                    } else if (typeof results[0][key] === 'string' && /^\d+(\.\d+)?$/.test(results[0][key])) {
                      // Include string columns that look like numbers (e.g., "65000.00")
                      chartRow[key] = row[key];
                    }
                  });
                  return chartRow;
                });
                chartType = 'bar';
              }
            }

            const botMessage = {
              text: `Found ${count} result(s).`,
              sender: 'bot',
              tableData: results,
              chartData: chartData,
              chartType: chartType
            };
            setMessages(prev => [...prev, botMessage]);
          } else {
            const botMessage = { text: "No results found for your query.", sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
          }
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
              {/* Message text - Found X result(s) */}
              {msg.text && (
                <div className="result-info">
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              )}
              {msg.tableData && (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(msg.tableData[0]).map(key => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {msg.tableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).map((value, colIndex) => (
                            <td key={colIndex}>{value || 'N/A'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {msg.chartData && msg.chartData.length > 0 && (
                <div className="chart-container">
                  {(() => {
                    // Fix values: parse string into number
                    const fixedData = msg.chartData.map(d => {
                      const fixed = { ...d };
                      Object.keys(fixed).forEach(key => {
                        if (key !== 'name' && typeof fixed[key] === 'string') {
                          // Extract numbers from the string
                          const nums = fixed[key].match(/\d+(\.\d+)?/g);
                          if (nums && nums.length > 0) {
                            fixed[key] = parseFloat(nums[0]); // Use first number
                          } else {
                            fixed[key] = 0;
                          }
                        }
                      });
                      return fixed;
                    });

                    return (
                      <>
                        {(!fixedData || fixedData.length === 0) && (
                          <div style={{color:"gray", textAlign:"center"}}>No chart data to display</div>
                        )}
                        <ResponsiveContainer width="100%" height={300}>
                          {msg.chartType === 'pie' ? (
                            <PieChart>
                              <Pie
                                data={fixedData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {fixedData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={`#${(index * 123456 % 0xffffff).toString(16).padStart(6, '0')}`} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          ) : (
                            <BarChart data={fixedData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              {Object.keys(fixedData[0]).filter(key => key !== 'name' && typeof fixedData[0][key] === 'number').map((key, idx) => (
                                <Bar key={key} dataKey={key} fill={`#${(idx * 123456 % 0xffffff).toString(16).padStart(6, '0')}`} name={key.charAt(0).toUpperCase() + key.slice(1)} />
                              ))}
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </>
                    );
                  })()}
                </div>
              )}
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