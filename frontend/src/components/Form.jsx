
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const Form = () => {
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const getId = (e) => {
        const id = uuidv4();
        setRoomId(id);
        toast.success("Created new room id");
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!roomId || !username) {
            toast.error('Please fill in both fields.');
            return;
        }

        if (roomId.length < 6) {
            toast.error('Room id must be at least 6 characters long.');
            return;
        }
        navigate(`/editor/${roomId}?username=${username}&roomId=${roomId}`);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-[#1b2921] rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Header with Logo */}
                <div className="p-6 pb-4 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Code Sync</h1>
                    <p className="text-gray-300 text-sm">Join or create a collaborative coding session</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 pt-2">
                    {/* Room ID Input */}
                    <div className="mb-6">
                        <label htmlFor="roomId" className="block text-sm font-medium text-gray-300 mb-2">
                            Room ID
                        </label>
                        <input
                            id="roomId"
                            className="w-full p-3 rounded-lg text-lg text-gray-900 bg-white border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                            type="text"
                            name="roomId"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder="Enter room ID"
                            required
                        />
                    </div>
                    
                    {/* Username Input */}
                    <div className="mb-6">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                            Username
                        </label>
                        <input
                            id="username"
                            className="w-full p-3 rounded-lg text-lg text-gray-900 bg-white border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                            type="text"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    
                    {/* Create Room Link */}
                    <div className="mb-8 text-center">
                        <p className="text-gray-300 text-sm">
                            Don't have a room ID?{' '}
                            <button
                                type="button"
                                className="text-green-400 hover:text-green-300 underline cursor-pointer transition-colors duration-200 font-medium"
                                onClick={getId}
                            >
                                Create one
                            </button>
                        </p>
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 shadow-lg"
                    >
                        Enter Room
                    </button>
                </form>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 rounded-full opacity-10 -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-500 rounded-full opacity-10 translate-y-8 -translate-x-8"></div>
            </div>
        </div>
    );
};

export default Form;
