import React from 'react';
import Client from './Client';

const EditorAside = ({ username, clients, leaveRoom, copyRoom }) => {
    return (
        <div className='w-full sm:w-80 lg:w-96 h-full bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 flex flex-col'>
            {/* Header */}
            <div className='p-4 sm:p-6 border-b border-gray-700'>
                {/* Elegant Code Sync Title */}
                <div className="flex items-center justify-center mb-6">
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
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-24 mx-auto"></div>
                    </div>
                </div>
                
                <h3 className='text-xl sm:text-2xl font-bold text-white text-center mb-2'>
                    Connected Users
                </h3>
                <p className='text-gray-400 text-sm text-center'>
                    {clients.length} {clients.length === 1 ? 'member' : 'members'} online
                </p>
            </div>

            {/* Connected Users */}
            <div className='flex-1 p-4 sm:p-6 overflow-y-auto'>
                <div className='grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4'>
                    {clients.map((client) => (
                        <Client key={client.socketId} username={client.username} />
                    ))}
                </div>
                
                {clients.length === 0 && (
                    <div className='text-center text-gray-500 mt-8'>
                        <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center'>
                            <svg className='w-8 h-8' fill='currentColor' viewBox='0 0 20 20'>
                                <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z'></path>
                            </svg>
                        </div>
                        <p>No users connected</p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className='p-4 sm:p-6 space-y-3 border-t border-gray-700'>
                <button
                    onClick={copyRoom}
                    className='w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] btn-hover'
                >
                    <div className='flex items-center justify-center space-x-2'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                        </svg>
                        <span>Copy Room ID</span>
                    </div>
                </button>
                
                <button 
                    onClick={leaveRoom}
                    className='w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] btn-hover'
                >
                    <div className='flex items-center justify-center space-x-2'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                        </svg>
                        <span>Leave Room</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default EditorAside;