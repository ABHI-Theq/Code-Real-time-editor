import React, { useEffect, useRef, useState } from 'react';
import AceEditor from 'react-ace';

// Import language modes
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-csharp';
import 'ace-builds/src-noconflict/mode-php';
import 'ace-builds/src-noconflict/mode-ruby';
import 'ace-builds/src-noconflict/mode-golang';
import 'ace-builds/src-noconflict/mode-rust';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/mode-sh';

// Import themes
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-dracula';

import { useSocket } from '../context/SocketContext';

const CodeEditor = ({ handleEditorChange, editorContent, roomId, username, language = 'javascript' }) => {
    const editorRef = useRef(null);
    const { socket } = useSocket();
    const [isTyping, setIsTyping] = useState({});
    const typingTimeoutRef = useRef({});

    // Language mode mapping
    const getLanguageMode = (lang) => {
        const modeMap = {
            'javascript': 'javascript',
            'python': 'python',
            'java': 'java',
            'cpp': 'c_cpp',
            'c': 'c_cpp',
            'csharp': 'csharp',
            'php': 'php',
            'ruby': 'ruby',
            'go': 'golang',
            'rust': 'rust',
            'typescript': 'typescript',
            'html': 'html',
            'css': 'css',
            'sql': 'sql',
            'bash': 'sh'
        };
        return modeMap[lang] || 'javascript';
    };

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

    // Handle editor content changes and typing indicators
    const handleEditorContentChange = (newValue) => {
        handleEditorChange(newValue);
        
        // Emit typing indicator
        if (socket && roomId && username) {
            socket.emit('user-typing', { roomId, username });
            
            // Clear existing typing timeout for this user
            if (typingTimeoutRef.current[username]) {
                clearTimeout(typingTimeoutRef.current[username]);
            }
            
            // Set new timeout to emit typing stopped
            typingTimeoutRef.current[username] = setTimeout(() => {
                socket.emit('typing-stopped', { roomId, username });
            }, 2000);
        }
    };

    useEffect(() => {
        const editor = editorRef.current?.editor;
        if (!editor) return;

        // Add custom styling to the editor
        editor.setOptions({
            fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
            fontSize: window.innerWidth < 640 ? 14 : 16,
        });

    }, [socket, roomId, username]);

    useEffect(() => {
        if (!socket) return;

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

        // Clean up typing indicators when user leaves
        socket.on('user-left', (data) => {
            setIsTyping(prev => {
                const newState = { ...prev };
                delete newState[data.username];
                return newState;
            });
        });

        return () => {
            socket.off('user-typing');
            socket.off('user-stopped-typing');
            socket.off('user-left');
        };
    }, [socket, username]);

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
                mode={getLanguageMode(language)}
                theme="monokai"
                name="editor"
                value={editorContent}
                onChange={handleEditorContentChange}
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