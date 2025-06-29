import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Form = () => {
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { socket } = useSocket();

    const getId = (e) => {
        e.preventDefault();
        const id = uuidv4();
        setRoomId(id);
        toast.success("Created new room ID", {
            style: {
                background: '#10B981',
                color: '#fff',
            },
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roomId || !username) {
            toast.error('Please fill in both fields.', {
                style: {
                    background: '#EF4444',
                    color: '#fff',
                },
            });
            return;
        }

        if (roomId.length < 6) {
            toast.error('Room ID must be at least 6 characters long.', {
                style: {
                    background: '#EF4444',
                    color: '#fff',
                },
            });
            return;
        }

        // Check if user is already in a room
        const existingRoomData = Object.keys(sessionStorage).find(key => 
            key.startsWith('room_') && key.includes(`_${username}`)
        );

        if (existingRoomData) {
            const existingRoomId = existingRoomData.split('_')[1];
            if (existingRoomId === roomId) {
                toast.error('You are already in this room!', {
                    style: {
                        background: '#EF4444',
                        color: '#fff',
                    },
                });
                return;
            } else {
                // Clear previous room data
                sessionStorage.removeItem(existingRoomData);
                toast.success('Switched from previous room', {
                    style: {
                        background: '#10B981',
                        color: '#fff',
                    },
                });
            }
        }

        setIsLoading(true);
        
        setTimeout(() => {
            navigate(`/editor/${roomId}?username=${username}&roomId=${roomId}`);
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className='w-full max-w-md mx-4 sm:mx-0 sm:w-[450px] lg:w-[500px] p-6 sm:p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 relative overflow-hidden'>
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
                {/* Elegant Code Sync Title */}
                <div className="flex justify-center mb-6">
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-wider">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                                CODE
                            </span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                SYNC
                            </span>
                        </h2>
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-20 mx-auto"></div>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Join Coding Session
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Collaborate in real-time with your team
                    </p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Room ID Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 block">
                            Room ID
                        </label>
                        <input
                            className='w-full p-3 sm:p-4 rounded-xl text-base sm:text-lg text-white bg-gray-800/50 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-400'
                            type="text"
                            name="roomId"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder='Enter room ID'
                            required
                        />
                    </div>
                    
                    {/* Username Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 block">
                            Username
                        </label>
                        <input
                            className='w-full p-3 sm:p-4 rounded-xl text-base sm:text-lg text-white bg-gray-800/50 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-400'
                            type="text"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder='Enter your username'
                            required
                        />
                    </div>
                    
                    {/* Create Room Link */}
                    <div className='text-center'>
                        <p className='text-gray-400 text-sm sm:text-base'>
                            Don't have a room ID?{' '}
                            <button
                                type="button"
                                className='text-blue-400 hover:text-blue-300 underline font-medium transition-colors duration-200'
                                onClick={getId}
                            >
                                Create new room
                            </button>
                        </p>
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 rounded-xl text-base sm:text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed btn-hover'
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Joining...</span>
                            </div>
                        ) : (
                            'Join Room'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Form;