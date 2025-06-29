import React, { useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import { useSocket } from '../context/SocketContext';

const CodeEditor = ({ handleEditorChange, editorContent, roomId, username }) => {
    const editorRef = useRef(null);
    const { socket } = useSocket();

    useEffect(() => {
        const editor = editorRef.current?.editor;
        if (!editor) return;

        // Add custom styling to the editor
        editor.setOptions({
            fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
            fontSize: window.innerWidth < 640 ? 14 : 16,
        });

    }, [socket, roomId, username]);

    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
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