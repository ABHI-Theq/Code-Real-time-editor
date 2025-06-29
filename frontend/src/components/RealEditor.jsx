import React, { useEffect, useRef, useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import { useSocket } from '../context/SocketContext';

const CodeEditor = ({ handleEditorChange, editorContent, roomId, username }) => {
    const editorRef = useRef(null);
    const { socket } = useSocket();
    const [userCursors, setUserCursors] = useState({});
    const [isTyping, setIsTyping] = useState({});
    const markersRef = useRef({});
    const typingTimeoutRef = useRef({});

    // Generate consistent colors for users
    const getUserColor = (username) => {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    // Handle cursor position changes
    const handleCursorChange = () => {
        if (!socket || !roomId || !username || !editorRef.current) return;

        const editor = editorRef.current.editor;
        if (!editor) return;

        const cursor = editor.selection.getCursor();
        socket.emit('cursor-position', {
            roomId,
            username,
            position: {
                row: cursor.row,
                column: cursor.column
            }
        });

        // Clear existing typing timeout for this user
        if (typingTimeoutRef.current[username]) {
            clearTimeout(typingTimeoutRef.current[username]);
        }
        
        // Set new timeout to emit typing stopped
        typingTimeoutRef.current[username] = setTimeout(() => {
            socket.emit('typing-stopped', { roomId, username });
        }, 2000);
    };

    // Update cursor markers in the editor
    const updateCursorMarkers = () => {
        const editor = editorRef.current?.editor;
        if (!editor) return;

        const session = editor.getSession();

        // Clear existing markers
        Object.values(markersRef.current).forEach(markerId => {
            session.removeMarker(markerId);
        });
        markersRef.current = {};

        // Add new markers for each user (excluding current user)
        Object.entries(userCursors).forEach(([user, position]) => {
            if (user === username) return; // Don't show own cursor

            const color = getUserColor(user);
            const range = new window.ace.Range(
                position.row, 
                position.column, 
                position.row, 
                position.column + 1
            );

            // Add cursor marker
            const markerId = session.addMarker(range, 'user-cursor', 'text', true);
            markersRef.current[user] = markerId;

            // Create cursor element
            const cursorElement = document.createElement('div');
            cursorElement.className = 'remote-cursor';
            cursorElement.style.cssText = `
                position: absolute;
                width: 2px;
                height: 20px;
                background-color: ${color};
                z-index: 1000;
                pointer-events: none;
                animation: blink 1s infinite;
            `;

            // Create user label
            const labelElement = document.createElement('div');
            labelElement.className = 'remote-cursor-label';
            labelElement.textContent = user;
            labelElement.style.cssText = `
                position: absolute;
                top: -25px;
                left: 0;
                background-color: ${color};
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
                white-space: nowrap;
                pointer-events: none;
                z-index: 1001;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;

            cursorElement.appendChild(labelElement);

            // Position cursor in editor
            const pixelPosition = editor.renderer.textToScreenCoordinates(position.row, position.column);
            const editorContainer = editor.container;
            
            cursorElement.style.left = `${pixelPosition.pageX - editorContainer.offsetLeft}px`;
            cursorElement.style.top = `${pixelPosition.pageY - editorContainer.offsetTop}px`;

            editorContainer.appendChild(cursorElement);

            // Remove cursor after 5 seconds if user stops typing
            setTimeout(() => {
                if (cursorElement.parentNode) {
                    cursorElement.parentNode.removeChild(cursorElement);
                }
            }, 5000);
        });
    };

    useEffect(() => {
        const editor = editorRef.current?.editor;
        if (!editor) return;

        // Add custom styling to the editor
        editor.setOptions({
            fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
            fontSize: window.innerWidth < 640 ? 14 : 16,
        });

        // Listen for cursor position changes
        editor.selection.on('changeCursor', handleCursorChange);

        // Add CSS for cursor animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            .remote-cursor {
                animation: blink 1s infinite;
            }
            .user-cursor {
                position: absolute;
                background-color: rgba(255, 255, 255, 0.3);
            }
        `;
        document.head.appendChild(style);

        return () => {
            editor.selection.off('changeCursor', handleCursorChange);
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        };
    }, [socket, roomId, username]);

    useEffect(() => {
        if (!socket) return;

        // Listen for other users' cursor positions
        socket.on('user-cursor-position', (data) => {
            // Only update if it's not the current user
            if (data.username !== username) {
                setUserCursors(prev => ({
                    ...prev,
                    [data.username]: data.position
                }));
            }
        });

        // Listen for typing indicators - only for other users
        socket.on('user-typing', (data) => {
            // Only show typing indicator for other users, not current user
            if (data.username !== username) {
                setIsTyping(prev => ({
                    ...prev,
                    [data.username]: true
                }));
            }
        });

        socket.on('user-stopped-typing', (data) => {
            // Only handle typing stopped for other users
            if (data.username !== username) {
                setIsTyping(prev => {
                    const newState = { ...prev };
                    delete newState[data.username];
                    return newState;
                });
            }
        });

        // Clean up cursor when user leaves
        socket.on('user-left', (data) => {
            setUserCursors(prev => {
                const newState = { ...prev };
                delete newState[data.username];
                return newState;
            });
            setIsTyping(prev => {
                const newState = { ...prev };
                delete newState[data.username];
                return newState;
            });
        });

        return () => {
            socket.off('user-cursor-position');
            socket.off('user-typing');
            socket.off('user-stopped-typing');
            socket.off('user-left');
        };
    }, [socket, username]);

    // Update cursor markers when userCursors change
    useEffect(() => {
        updateCursorMarkers();
    }, [userCursors]);

    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-gray-700 shadow-2xl relative">
            {/* Typing indicators - only show other users typing */}
            {Object.keys(isTyping).length > 0 && (
                <div className="absolute top-2 right-2 z-50 flex flex-wrap gap-2">
                    {Object.keys(isTyping).map(user => (
                        <div
                            key={user}
                            className="flex items-center space-x-1 bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white border"
                            style={{ borderColor: getUserColor(user) }}
                        >
                            <div
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: getUserColor(user) }}
                            ></div>
                            <span>{user} is typing...</span>
                        </div>
                    ))}
                </div>
            )}

            <AceEditor
                ref={editorRef}
                mode="javascript"
                theme="monokai"
                name="editor"
                value={editorContent}
                onChange={handleEditorChange}
                width="100%"
                height="100%"
                fontSize={window.innerWidth < 640 ? 14 : 16}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                    showLineNumbers: true,
                    tabSize: 2,
                    wrap: true,
                    showPrintMargin: false,
                    highlightActiveLine: true,
                    highlightSelectedWord: true,
                }}
                editorProps={{
                    $blockScrolling: true
                }}
            />
        </div>
    );
};

export default CodeEditor;