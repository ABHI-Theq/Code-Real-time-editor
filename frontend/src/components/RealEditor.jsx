import React, { useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import { useSocket } from '../context/SocketContext';

const CodeEditor = ({ handleEditorChange, editorContent, roomId, username }) => {
  const editorRef = useRef(null);
  const { socket } = useSocket();

  useEffect(() => {
    const editor = editorRef.current.editor;

  //   const emitCursorPosition = () => {
  //     const cursorPosition = editor.getCursorPosition();
  //     socket.emit('cursor-move', { position: cursorPosition, roomId, username });
  //   };

  //   const handleCursorChange = () => {
  //     emitCursorPosition();
  //     clearTimeout(editorRef.current.cursorTimeout);
  //     editorRef.current.cursorTimeout = setTimeout(() => {
  //       socket.emit('cursor-stop', { roomId, username });
  //     }, 1000);
  //   };

  //   editor.getSession().selection.on("changeCursor", handleCursorChange);
  //   editor.on("input", handleCursorChange);

  //   return () => {
  //     editor.getSession().selection.off("changeCursor", handleCursorChange);
  //     editor.off("input", handleCursorChange);
  //   };
  }, [socket, roomId, username]);

  return (
    <AceEditor
      ref={editorRef}
      mode="javascript"
      theme="monokai"
      name="editor"
      value={editorContent}
      onChange={handleEditorChange}
      width="99%"
      height="100%"
      fontSize={16}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
      }}
    />
  );
};

export default CodeEditor;
