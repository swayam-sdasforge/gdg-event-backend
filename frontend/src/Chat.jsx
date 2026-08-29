import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Connect to the backend
const socket = io('http://localhost:5000');

function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const room = 'global_chat'; // Hardcoded for simplicity in demo

  useEffect(() => {
    // Fetch chat history from DB when component loads
    fetch(`http://localhost:5000/api/messages/${room}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(err => console.error(err));

    // Join the room on component mount
    socket.emit('join_room', room);

    // Listen for incoming messages
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const messageData = {
      sender_id: user.id, // In a real app, backend uses this to lookup name
      room: room,
      content: messageInput
    };

    socket.emit('send_message', messageData);
    setMessageInput('');
  };

  return (
    <div className="chat-container">
      <h3>Live Event Chat</h3>
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble-wrapper ${msg.sender_id === user.id ? 'my-message-wrapper' : 'other-message-wrapper'}`}>
            {msg.sender_id !== user.id && (
              <span className="sender-name">{msg.sender_name || 'Participant'}</span>
            )}
            <div className={`chat-bubble ${msg.sender_id === user.id ? 'my-message' : 'other-message'}`}>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="chat-input">
        <input 
          type="text" 
          value={messageInput} 
          onChange={(e) => setMessageInput(e.target.value)} 
          placeholder="Type a message..." 
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
