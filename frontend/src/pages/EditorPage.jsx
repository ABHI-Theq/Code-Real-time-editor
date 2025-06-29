import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EditorAside from '../components/EditorAside';
import CodeEditor from '../components/RealEditor';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import Chat from '../components/Chat';
import MessageNotification from '../components/MessageNotification';
import team from '../assets/team.png';
import groupChat from '../assets/groupChat.png';

const EditorPage = () => {
    const [searchParams] = useSearchParams();
    const username = searchParams?.get('username');
    const roomId = searchParams?.get('roomId');
    const { socket } = useSocket();
    const [editorContent, setEditorContent] = useState("console.log('hello world')");
    const [executionResult, setExecutionResult] = useState('');
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

    // Check if user is already in room
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

    }, [username, roomId, navigate]);

    const copyToClipboard = () => {
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
    };

    const leaveRoom = () => {
        // Clear session storage when leaving
        sessionStorage.removeItem(`room_${roomId}_${username}`);
        socket.emit('leaveRoom', { username, roomId });
        navigate('/');
    };

    const handleEditorChange = (newValue) => {
        setEditorContent(newValue);
        socket.emit('editor-update', { content: newValue, roomId });
    };

    const executeCode = () => {
        try {
            const log = [];
            const originalConsoleLog = console.log;
            console.log = (...args) => {
                log.push(args.join(' '));
                originalConsoleLog.apply(console, args);
            };
            eval(editorContent);
            console.log = originalConsoleLog;
            setOutput(true);
            setExecutionResult(log.join('\n') || 'Code executed successfully (no output)');
        } catch (error) {
            setExecutionResult(`Error: ${error.message}`);
            setOutput(true);
        }
    };

    const toggleSidebar = (type) => {
        if (isMobile) {
            setSidebarOpen(!sidebarOpen);
        }
        setEditoraside(type === 'members');
        setChatsection(type === 'chat');
    };

    const handleCloseNotification = () => {
        setMessageNotification(null);
    };

    useEffect(() => {
        if (username && roomId && !isUserAlreadyInRoom) {
            socket.emit("user-joined-room", { username, roomId });
        }

        socket.on('user-joined', (data) => {
            setUserData(data.clients || []);
            if (data.username !== username) {
                toast.success(`${data.username} joined the room`, {
                    style: {
                        background: '#10B981',
                        color: '#fff',
                    },
                });
            }
        });

        socket.on('user-left', (data) => {
            setUserData(data.clients || []);
            if (data.username !== username) {
                toast.success(`${data.username} left the room`, {
                    style: {
                        background: '#F59E0B',
                        color: '#fff',
                    },
                });
            }
        });

        socket.on("sending-updated-content", (data) => {
            setEditorContent(data.content);
        });

        socket.on('new-message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
            
            // Show notification popup only if message is from another user and chat is not open
            if (data.username !== username && (!chatsection || (isMobile && !sidebarOpen))) {
                setMessageNotification(data);
            }
        });

        socket.on('error', (errorMessage) => {
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
        });

        const handleBeforeUnload = (event) => {
            sessionStorage.removeItem(`room_${roomId}_${username}`);
            socket.emit('leaveRoom', { username, roomId });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleBeforeUnload);

        return () => {
            socket.off('user-joined');
            socket.off('user-left');
            socket.off("sending-updated-content");
            socket.off('new-message');
            socket.off('error');
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleBeforeUnload);
            sessionStorage.removeItem(`room_${roomId}_${username}`);
            socket.emit('leaveRoom', { username, roomId });
        };
    }, [socket, username, roomId, navigate, isUserAlreadyInRoom, chatsection, isMobile, sidebarOpen]);

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
                {/* Editor */}
                <div className='flex-1 p-4 relative'>
                    <CodeEditor
                        handleEditorChange={handleEditorChange}
                        editorContent={editorContent}
                        roomId={roomId}
                        username={username}
                    />
                    
                    {/* Run Button */}
                    <button
                        onClick={executeCode}
                        className='absolute top-6 right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex justify-center items-center cursor-pointer transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg shadow-green-500/25'
                    >
                        <svg className='w-6 h-6 sm:w-7 sm:h-7' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z' clipRule='evenodd' />
                        </svg>
                    </button>
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