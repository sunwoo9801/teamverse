// src/components/Chatbox.js
import React, { useState } from 'react';
import '../styles/Chatbox.css';

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, time: new Date().toLocaleTimeString() }]);
      setNewMessage('');
    }
  };

  return (
    <div className="chatbox">
      <h3>Team Chat</h3>
      <div className="message-container">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span>{msg.time}</span>: {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chatbox;
