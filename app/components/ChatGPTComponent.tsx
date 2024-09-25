'use client';
import React, { useState } from 'react';


interface ChatGPTResponse {
  reply?: string;
  message?: string;
}

const ChatGPTComponent: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [reply, setReply] = useState<string>('Waiting');
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message.');
      return;
    }

    setLoading(true);
    setReply('');

    try {
      const res = await fetch('/api/chatgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data: ChatGPTResponse = await res.json();

      if (res.ok) {
        setReply(data.reply || '');
      } else {
        console.error('Error:', data.message);
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('An error occurred while sending the message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">Chat with ChatGPT</h1>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows={4}
        placeholder="Enter your message here..."
        value={message}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
      ></textarea>
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
      {reply && (
        <div className="mt-4 p-2 border rounded">
          <strong>ChatGPT:</strong>
          <p>{reply}</p>
        </div>
      )}
    </div>
  );
};

export default ChatGPTComponent;
