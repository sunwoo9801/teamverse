import React, { useState } from 'react';
import '../styles/Chatbox.css';
import FileManager from './FileManager';


const Chatbox = () => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Alice', content: 'Hello Team!' },
    { id: 2, user: 'Bob', content: 'Hi Alice!' },
  ]);

  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: messages.length + 1, user: 'You', content: input }]);
      setInput('');
    }
  };

  return (
    <div className="chatbox">
      <h3>Chat</h3>
      <div className="messages">
        {messages.map((msg) => (
          <p key={msg.id}>
            <strong>{msg.user}: </strong>{msg.content}
          </p>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={handleSend}>Send</button>
        
      </div>
      <FileManager /> {/* 파일 관리 기능 추가 */}
    </div>
  );
};

export default Chatbox;
