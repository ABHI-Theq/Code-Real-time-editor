import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const Chat = ({ username, roomId, messages }) => {
  const { socket } = useSocket();
  const [text, setText] = useState('');
  const chatEndRef = useRef(null);

  function onMessageSubmit() {
    // console.log(text);
    socket.emit('GroupMessage', { message: text, username, roomId });
    setText('');
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className='w-[22%] h-screen p-4 border-r-4 border-r-white aside'>
      <h1 className='text-2xl font-bold font-mono'>Group Chat</h1>
      <div className='border border-green-500 rounded my-2 '></div>
      <div className='relative h-[92vh] my-4 rounded-lg bg-[#3d3d3d] border-2 border-pink-500'>
        <div className='h-[94%] overflow-y-auto'>
          <div className='w-full p-2'>
            {messages.length > 0 ? (
              messages.map((message) => {
                return (
                  <div key={message.socketId} className={`mb-2 flex gap-x-2 ${message.username === username ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col max-w-[50%] ${message.username === username ? 'bg-[#2c003e]' : 'bg-[#3721c9]'} p-2 rounded-xl`}>
                      <h3 className={`font-bold text-lg font-mono ${message.username === username ? 'text-red-400' : 'text-gray-400'}`}>{message.username}</h3>
                      <p className={`text-md font-semibold`}>{message.message}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='text-center text-lg font-bold font-mono'>No messages yet</div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        <div className='w-full p-2 flex absolute bottom-0 rounded-lg gap-x-2'>
          <input
            className='w-[80%] p-2 rounded-lg text-black text-md overflow-y-auto'
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            name='message'
          />
          <button 
            onClick={onMessageSubmit}
            className='bg-[#4aed88] rounded-lg text-black font-sans font-semibold px-2 py-1 text-xl hover:bg-green-500 active:bg-green-600'
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;