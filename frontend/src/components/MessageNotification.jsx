import React, { useEffect, useState } from 'react';

const MessageNotification = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            // Auto-hide after 4 seconds
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for fade out animation
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div className={`fixed bottom-4 left-4 z-50 transition-all duration-300 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
            <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-xl p-4 shadow-2xl max-w-sm">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-blue-400 text-sm font-medium">New Message</span>
                        </div>
                        <div className="text-gray-300 text-sm font-medium mb-1">
                            {message.username}
                        </div>
                        <div className="text-white text-sm break-words">
                            {message.message.length > 60 
                                ? `${message.message.substring(0, 60)}...` 
                                : message.message
                            }
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                            {new Date(message.time).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="ml-2 p-1 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageNotification;