import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EditorAside from '../components/EditorAside';
import CodeEditor from '../components/RealEditor';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import Chat from '../components/Chat';
import LanguageSelector from '../components/LanguageSelector';
import { executeCode, getDefaultCode } from '../services/codeExecutionService';
import team from '../assets/team.png';
import groupChat from '../assets/groupChat.png';

const EditorPage = () => {
    const [searchParams] = useSearchParams();
    const username = searchParams?.get('username');
    const roomId = searchParams?.get('roomId');
    const { socket } = useSocket();
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [editorContent, setEditorContent] = useState(getDefaultCode('javascript'));
    const [executionResult, setExecutionResult] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [userInput, setUserInput] = useState('');
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [output, setOutput] = useState(false);
    const [editoraside, setEditoraside] = useState(true);
    const [chatsection, setChatsection] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState([]);
    const [isUserAlreadyInRoom, setIsUserAlreadyInRoom] = useState(false);
    const [messageNotification, setMessageNotification] = useState(null);
    
    // Use refs to track current state values for socket callbacks
    const currentUsernameRef = useRef(username);
    const currentRoomIdRef = useRef(roomId);
    const currentChatsectionRef = useRef(chatsection);
    const currentSidebarOpenRef = useRef(sidebarOpen);
    const currentIsMobileRef = useRef(isMobile);
    const hasJoinedRoomRef = useRef(false);

    // Update refs when state changes
    useEffect(() => {
        currentUsernameRef.current = username;
        currentRoomIdRef.current = roomId;
        currentChatsectionRef.current = chatsection;
        currentSidebarOpenRef.current = sidebarOpen;
        currentIsMobileRef.current = isMobile;
    }, [username, roomId, chatsection, sidebarOpen, isMobile]);

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Check if user is already in room - only run once
    useEffect(() => {
        if (!username || !roomId) {
            navigate('/');
            return;
        }

        // Check if user is trying to join the same room again
        const currentRoomData = sessionStorage.getItem(`room_${roomId}_${username}`);
        if (currentRoomData) {
            setIsUserAlreadyInRoom(true);
            toast.error('You are already in this room! Redirecting to home page.', {
                style: {
                    background: '#EF4444',
                    color: '#fff',
                },
                duration: 3000,
            });
            setTimeout(() => {
                navigate('/');
            }, 2000);
            return;
        }

        // Store user session data
        sessionStorage.setItem(`room_${roomId}_${username}`, JSON.stringify({
            username,
            roomId,
            joinedAt: Date.now()
        }));

    }, []); // Empty dependency array - only run once

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(roomId).then(() => {
            toast.success("Room ID copied successfully", {
                style: {
                    background: '#10B981',
                    color: '#fff',
                },
            });
        }).catch((e) => {
            toast.error(e.message, {
                style: {
                    background: '#EF4444',
                    color: '#fff',
                },
            });
        });
    }, [roomId]);

    const leaveRoom = useCallback(() => {
        // Clear session storage when leaving
        sessionStorage.removeItem(`room_${roomId}_${username}`);
        if (socket && hasJoinedRoomRef.current) {
            socket.emit('leaveRoom', { username, roomId });
        }
        navigate('/');
    }, [socket, username, roomId, navigate]);

    // Debounce timer ref for editor updates
    const editorUpdateTimerRef = useRef(null);
    
    const handleEditorChange = useCallback((newValue) => {
        setEditorContent(newValue);
        
        if (socket && roomId) {
            // Clear previous timer
            if (editorUpdateTimerRef.current) {
                clearTimeout(editorUpdateTimerRef.current);
            }
            
            // Debounce socket emit to reduce network calls (16ms = ~60fps)
            editorUpdateTimerRef.current = setTimeout(() => {
                socket.emit('editor-update', { content: newValue, roomId });
            }, 16);
        }
    }, [socket, roomId]);

    const handleExecuteCode = useCallback(async () => {
        setIsExecuting(true);
        setOutput(true);
        setExecutionResult('Executing code...');

        try {
            const result = await executeCode(editorContent, selectedLanguage, userInput);
            
            if (result.success) {
                const output = result.output || 'Code executed successfully (no output)';
                const timeInfo = result.executionTime 
                    ? `\n\n⏱️ Execution time: ${result.executionTime}s` 
                    : '';
                setExecutionResult(output + timeInfo);
                toast.success('Code executed successfully!', {
                    style: {
                        background: '#10B981',
                        color: '#fff',
                    },
                });
            } else {
                setExecutionResult(result.error || 'Execution failed');
                toast.error('Execution failed', {
                    style: {
                        background: '#EF4444',
                        color: '#fff',
                    },
                });
            }
        } catch (error) {
            setExecutionResult(`Error: ${error.message}`);
            toast.error('Execution error', {
                style: {
                    background: '#EF4444',
                    color: '#fff',
                },
            });
        } finally {
            setIsExecuting(false);
        }
    }, [editorContent, selectedLanguage, userInput]);

    const handleLanguageChange = useCallback((newLanguage) => {
        setSelectedLanguage(newLanguage);
        // Optionally load default template for new language
        if (editorContent === getDefaultCode(selectedLanguage) || editorContent.trim() === '') {
            const newContent = getDefaultCode(newLanguage);
            setEditorContent(newContent);
            if (socket && roomId) {
                socket.emit('editor-update', { content: newContent, roomId });
            }
        }
        toast.success(`Switched to ${newLanguage}`, {
            style: {
                background: '#3B82F6',
                color: '#fff',
            },
        });
    }, [editorContent, selectedLanguage, socket, roomId]);

    const toggleSidebar = useCallback((type) => {
        if (isMobile) {
            setSidebarOpen(!sidebarOpen);
        }
        setEditoraside(type === 'members');
        setChatsection(type === 'chat');
    }, [isMobile, sidebarOpen]);

    const handleCloseNotification = useCallback(() => {
        setMessageNotification(null);
    }, []);

    // Socket event handlers - only set up once
    useEffect(() => {
        if (!socket || !username || !roomId || isUserAlreadyInRoom || hasJoinedRoomRef.current) {
            return;
        }

        // Join room only once
        socket.emit("user-joined-room", { username, roomId });
        hasJoinedRoomRef.current = true;

        // Set up socket event listeners
        const handleUserJoined = (data) => {
            setUserData(data.clients || []);
            if (data.username !== currentUsernameRef.current) {
                toast.success(`${data.username} joined the room`, {
                    style: {
                        background: '#10B981',
                        color: '#fff',
                    },
                });
            }
        };

        const handleUserLeft = (data) => {
            setUserData(data.clients || []);
            if (data.username !== currentUsernameRef.current) {
                toast.success(`${data.username} left the room`, {
                    style: {
                        background: '#F59E0B',
                        color: '#fff',
                    },
                });
            }
        };

        const handleUpdatedContent = (data) => {
            setEditorContent(data.content);
        };

        const handleNewMessage = (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
            
            // Show notification popup only if message is from another user and chat is not open
            if (data.username !== currentUsernameRef.current && 
                (!currentChatsectionRef.current || (currentIsMobileRef.current && !currentSidebarOpenRef.current))) {
                setMessageNotification(data);
            }
        };

        const handleError = (errorMessage) => {
            if (errorMessage.includes('already in room') || errorMessage.includes('duplicate')) {
                setIsUserAlreadyInRoom(true);
                toast.error('You are already in this room! Redirecting to home page.', {
                    style: {
                        background: '#EF4444',
                        color: '#fff',
                    },
                    duration: 3000,
                });
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                toast.error(errorMessage, {
                    style: {
                        background: '#EF4444',
                        color: '#fff',
                    },
                });
            }
        };

        // Add event listeners
        socket.on('user-joined', handleUserJoined);
        socket.on('user-left', handleUserLeft);
        socket.on("sending-updated-content", handleUpdatedContent);
        socket.on('new-message', handleNewMessage);
        socket.on('error', handleError);

        // Cleanup function
        return () => {
            socket.off('user-joined', handleUserJoined);
            socket.off('user-left', handleUserLeft);
            socket.off("sending-updated-content", handleUpdatedContent);
            socket.off('new-message', handleNewMessage);
            socket.off('error', handleError);
        };
    }, [socket, username, roomId, isUserAlreadyInRoom, navigate]);

    // Handle page unload/refresh
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (hasJoinedRoomRef.current) {
                sessionStorage.removeItem(`room_${roomId}_${username}`);
                if (socket) {
                    socket.emit('leaveRoom', { username, roomId });
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleBeforeUnload);
            // Clean up when component unmounts
            if (hasJoinedRoomRef.current) {
                sessionStorage.removeItem(`room_${roomId}_${username}`);
                if (socket) {
                    socket.emit('leaveRoom', { username, roomId });
                }
            }
        };
    }, [socket, username, roomId]);

    // Message notification component
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

    // Don't render if user is already in room
    if (isUserAlreadyInRoom) {
        return (
            <div className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full h-screen text-white flex items-center justify-center'>
                <div className='text-center'>
                    <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-xl'>Redirecting to home page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full h-screen text-white flex relative overflow-hidden'>
            {/* Mobile Header */}
            {isMobile && (
                <div className='absolute top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                            <div className="text-center">
                                <h2 className="text-lg font-bold text-white tracking-wider">
                                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                                        CODE
                                    </span>
                                    <span className="mx-1 text-gray-300">•</span>
                                    <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        SYNC
                                    </span>
                                </h2>
                            </div>
                            <div>
                                <p className='text-xs text-gray-400'>{userData.length} members</p>
                            </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <button
                                onClick={() => toggleSidebar('members')}
                                className={`p-2 rounded-lg transition-colors ${editoraside && sidebarOpen ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                <img className='w-5 h-5 invert' src={team} alt="Members" />
                            </button>
                            <button
                                onClick={() => toggleSidebar('chat')}
                                className={`p-2 rounded-lg transition-colors ${chatsection && sidebarOpen ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                <img className='w-5 h-5 invert' src={groupChat} alt="Chat" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar Navigation */}
            {!isMobile && (
                <div className='w-20 h-full bg-gray-900 border-r border-gray-700 flex flex-col items-center justify-start py-6 space-y-4'>
                    <button
                        onClick={() => toggleSidebar('members')}
                        className={`w-14 h-14 rounded-xl p-3 transition-all duration-300 transform hover:scale-105 ${
                            editoraside ? 'bg-blue-600 shadow-lg shadow-blue-600/25' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        <img className='w-full h-full invert' src={team} alt="Members" />
                    </button>
                    <button
                        onClick={() => toggleSidebar('chat')}
                        className={`w-14 h-14 rounded-xl p-3 transition-all duration-300 transform hover:scale-105 ${
                            chatsection ? 'bg-blue-600 shadow-lg shadow-blue-600/25' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        <img className='w-full h-full invert' src={groupChat} alt="Chat" />
                    </button>
                </div>
            )}

            {/* Sidebar Content */}
            {((isMobile && sidebarOpen) || !isMobile) && (
                <div className={`${isMobile ? 'absolute top-16 left-0 bottom-0 z-40 w-80' : 'relative'} ${isMobile ? 'slide-in-left' : ''}`}>
                    {editoraside && (
                        <EditorAside 
                            username={username} 
                            clients={userData} 
                            leaveRoom={leaveRoom} 
                            copyRoom={copyToClipboard} 
                        />
                    )}
                    {chatsection && (
                        <Chat 
                            username={username} 
                            roomId={roomId} 
                            messages={messages} 
                        />
                    )}
                </div>
            )}

            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div 
                    className='absolute inset-0 bg-black/50 z-30'
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Editor Area */}
            <div className={`flex-1 flex flex-col ${isMobile ? 'pt-16' : ''}`}>
                {/* Editor Header with Language Selector */}
                <div className='px-4 pt-4 pb-2 flex items-center justify-between bg-gray-900/50'>
                    <div className='flex items-center space-x-3'>
                        <span className='text-gray-400 text-sm'>Language:</span>
                        <LanguageSelector 
                            selectedLanguage={selectedLanguage}
                            onLanguageChange={handleLanguageChange}
                        />
                    </div>
                    <div className='flex items-center space-x-2'>
                        <button
                            onClick={handleExecuteCode}
                            disabled={isExecuting}
                            className='flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:transform-none shadow-lg'
                        >
                            {isExecuting ? (
                                <>
                                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                                    <span className='text-sm'>Running...</span>
                                </>
                            ) : (
                                <>
                                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                                        <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z' clipRule='evenodd' />
                                    </svg>
                                    <span className='text-sm'>Run Code</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Editor */}
                <div className='flex-1 p-4 pt-2 relative'>
                    <CodeEditor
                        handleEditorChange={handleEditorChange}
                        editorContent={editorContent}
                        roomId={roomId}
                        username={username}
                        language={selectedLanguage}
                    />
                </div>

                {/* Input Panel */}
                <div className='mx-4 mb-2 bg-gray-900 border border-gray-700 rounded-xl p-3'>
                    <div className='flex items-center space-x-2'>
                        <label className='text-sm text-gray-400 whitespace-nowrap'>Input (stdin):</label>
                        <input
                            type='text'
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder='Enter input for your program (e.g., "John" or "5 10")'
                            className='flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600'
                        />
                    </div>
                </div>

                {/* Output Panel */}
                <div className={`mx-4 mb-4 bg-gray-900 border border-gray-700 rounded-xl transition-all duration-500 ease-in-out overflow-hidden ${
                    output ? 'h-48 sm:h-64' : 'h-12'
                }`}>
                    <div className='p-4 h-full flex flex-col'>
                        <div className='flex items-center justify-between mb-2'>
                            <h3 className='text-lg font-bold text-white flex items-center space-x-2'>
                                <svg className='w-5 h-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                                    <path fillRule='evenodd' d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z' clipRule='evenodd' />
                                </svg>
                                <span>Output</span>
                            </h3>
                            {output && (
                                <button
                                    onClick={() => setOutput(false)}
                                    className='p-1 rounded-lg hover:bg-gray-800 transition-colors'
                                >
                                    <svg className='w-5 h-5 text-gray-400 hover:text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                </button>
                            )}
                        </div>
                        
                        {output && (
                            <div className='flex-1 overflow-y-auto'>
                                <pre className='text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-800 p-3 rounded-lg'>
                                    {executionResult || 'No output'}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Message Notification Popup */}
            <MessageNotification 
                message={messageNotification} 
                onClose={handleCloseNotification} 
            />
        </div>
    );
};

export default EditorPage;