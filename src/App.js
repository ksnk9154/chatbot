import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Brush } from 'recharts';
import domtoimage from 'dom-to-image';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [zoomLevels, setZoomLevels] = useState({});
  const messagesEndRef = useRef(null);
  const chartRefs = useRef([]);

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
            // Data normalization: Convert string numbers to actual numbers
            const keys = Object.keys(results[0]);
            const normalizedResults = results.map(row => {
              const normalizedRow = {};
              keys.forEach(key => {
                const value = row[key];
                // Convert string numbers to actual numbers
                if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) {
                  normalizedRow[key] = parseFloat(value);
                } else {
                  normalizedRow[key] = value;
                }
              });
              return normalizedRow;
            });

            // Check if data is suitable for charts (e.g., has numerical values)
            const hasNumbers = keys.some(key => typeof normalizedResults[0][key] === 'number');

            // Determine chart type based on data characteristics
            let chartType = null;
            let chartData = null;

            if (hasNumbers) {
              // Check if this looks like categorical data (few unique values in a text column)
              const textColumns = keys.filter(key => typeof normalizedResults[0][key] === 'string');
              const isCategorical = textColumns.some(col => {
                const uniqueValues = new Set(normalizedResults.map(row => row[col])).size;
                return uniqueValues <= 5 && uniqueValues < normalizedResults.length * 0.3; // Very strict: less than 5 unique values and less than 30% unique
              });

              if (isCategorical && textColumns.length > 0 && normalizedResults.length > 5) {
                // Use pie chart only for truly categorical data with many rows
                const categoryCol = textColumns.find(col => col.toLowerCase().includes('category')) || textColumns[0]; // Prefer 'category' column
                const valueCol = keys.find(key => key.toLowerCase().includes('price') || key.toLowerCase().includes('stock')) || keys.find(key => typeof normalizedResults[0][key] === 'number'); // Prefer price/stock

                if (valueCol) {
                  const aggregatedData = {};
                  normalizedResults.forEach(row => {
                    const category = row[categoryCol] || 'Other';
                    aggregatedData[category] = (aggregatedData[category] || 0) + (row[valueCol] || 0);
                  });

                  chartData = Object.entries(aggregatedData).map(([name, value]) => ({ name, value }));
                  chartType = 'pie';
                }
              } else {
                // Use bar chart for general numerical data
                chartData = normalizedResults.map((row, index) => {
                  const name = row.name || row.category || `Row ${index + 1}`;
                  const chartRow = { name };
                  // Include only numeric columns
                  keys.forEach(key => {
                    if (typeof normalizedResults[0][key] === 'number') {
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
              tableData: normalizedResults,
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

  const handleZoomIn = (messageIndex) => {
    setZoomLevels(prev => ({
      ...prev,
      [messageIndex]: (prev[messageIndex] || 1) + 0.2
    }));
  };

  const handleZoomOut = (messageIndex) => {
    setZoomLevels(prev => ({
      ...prev,
      [messageIndex]: Math.max(0.5, (prev[messageIndex] || 1) - 0.2)
    }));
  };

  const handleDownload = async (chartRef, messageIndex) => {
    if (!chartRef) return;
    try {
      const dataUrl = await domtoimage.toPng(chartRef);
      const link = document.createElement('a');
      link.download = `chart_${messageIndex}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
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
                  <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px', marginBottom: '10px' }}>
                    <strong>Chart Data:</strong> {msg.chartData.length} items, Type: {msg.chartType}
                    {msg.chartData[0] && (
                      <div>
                        <strong>Keys:</strong> {Object.keys(msg.chartData[0]).join(', ')}
                        <br />
                        <strong>Sample:</strong> {JSON.stringify(msg.chartData[0]).substring(0, 100)}...
                      </div>
                    )}
                    <div style={{ marginTop: '10px' }}>
                      <button onClick={() => handleZoomIn(index)} style={{ marginRight: '5px' }} title="Zoom In">🔍+</button>
                      <button onClick={() => handleZoomOut(index)} style={{ marginRight: '5px' }} title="Zoom Out">🔍-</button>
                      <button onClick={() => handleDownload(chartRefs.current[index], index)} title="Download">📥</button>
                    </div>
                  </div>
                  <div ref={(el) => chartRefs.current[index] = el}>
                    <ResponsiveContainer width="100%" height={300 * (zoomLevels[index] || 1)}>
                      {msg.chartType === 'pie' ? (
                        <PieChart>
                          <Pie
                            data={msg.chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80 * (zoomLevels[index] || 1)}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {msg.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`#${(index * 123456 % 0xffffff).toString(16).padStart(6, '0')}`} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      ) : (
                        <BarChart data={msg.chartData.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Brush dataKey="name" height={30} stroke="#8884d8" />
                          {Object.keys(msg.chartData[0] || {}).filter(key => key !== 'name' && typeof (msg.chartData[0] || {})[key] === 'number').map((key, idx) => (
                            <Bar key={key} dataKey={key} fill={`#${(idx * 123456 % 0xffffff).toString(16).padStart(6, '0')}`} name={key.charAt(0).toUpperCase() + key.slice(1)} isAnimationActive={false} />
                          ))}
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
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