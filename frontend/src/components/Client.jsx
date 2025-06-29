import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username }) => {
    return (
        <div className='bg-gray-800/50 rounded-xl p-3 sm:p-4 text-center hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/50'>
            <div className='flex flex-col items-center space-y-2'>
                <div className='relative'>
                    <Avatar 
                        name={username} 
                        size={window.innerWidth < 640 ? 40 : 50} 
                        round="12px"
                        className='shadow-lg'
                    />
                    <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800'></div>
                </div>
                <span className='text-white text-sm sm:text-base font-medium truncate w-full' title={username}>
                    {username}
                </span>
            </div>
        </div>
    );
};

export default Client;