import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const Chat = ({ username, roomId, messages }) => {
    const { socket } = useSocket();
    const [text, setText] = useState('');
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    function onMessageSubmit(e) {
        e.preventDefault();
        if (text.trim()) {
            socket.emit('GroupMessage', { message: text.trim(), username, roomId });
            setText('');
        }
    }

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onMessageSubmit(e);
        }
    };

    return (
        <div className='w-full sm:w-80 lg:w-96 h-full bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 flex flex-col'>
            {/* Header */}
            <div className='p-4 sm:p-6 border-b border-gray-700'>
                <h1 className='text-xl sm:text-2xl font-bold text-white text-center mb-2'>
                    Group Chat
                </h1>
                <p className='text-gray-400 text-sm text-center'>
                    {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                </p>
                <div className='h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mt-4'></div>
            </div>

            {/* Messages Container */}
            <div className='flex-1 overflow-hidden flex flex-col'>
                <div className='flex-1 overflow-y-auto p-4 space-y-3'>
                    {messages.length > 0 ? (
                        messages.map((message, index) => {
                            const isOwnMessage = message.username === username;
                            return (
                                <div 
                                    key={`${message.socketId}-${index}`} 
                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] rounded-2xl p-3 ${
                                        isOwnMessage 
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                                            : 'bg-gray-700 text-white'
                                    } shadow-lg`}>
                                        <div className={`text-xs font-medium mb-1 ${
                                            isOwnMessage ? 'text-blue-100' : 'text-gray-300'
                                        }`}>
                                            {message.username}
                                        </div>
                                        <p className='text-sm sm:text-base break-words'>
                                            {message.message}
                                        </p>
                                        <div className={`text-xs mt-1 ${
                                            isOwnMessage ? 'text-blue-100' : 'text-gray-400'
                                        }`}>
                                            {new Date(message.time).toLocaleTimeString([], { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className='flex-1 flex items-center justify-center'>
                            <div className='text-center text-gray-500'>
                                <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center'>
                                    <svg className='w-8 h-8' fill='currentColor' viewBox='0 0 20 20'>
                                        <path fillRule='evenodd' d='M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z' clipRule='evenodd'></path>
                                    </svg>
                                </div>
                                <p className='text-sm'>No messages yet</p>
                                <p className='text-xs mt-1'>Start the conversation!</p>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Message Input */}
                <div className='p-4 border-t border-gray-700'>
                    <form onSubmit={onMessageSubmit} className='flex space-x-2'>
                        <input
                            ref={inputRef}
                            className='flex-1 p-3 rounded-xl text-white bg-gray-800/50 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-400 text-sm sm:text-base'
                            type='text'
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder='Type a message...'
                            maxLength={500}
                        />
                        <button 
                            type="submit"
                            disabled={!text.trim()}
                            className='bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:transform-none'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;