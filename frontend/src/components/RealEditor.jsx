import React, { useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';

const CodeEditor = ({ handleEditorChange, editorContent }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = editorRef.current.editor;

    return () => {
      editor.off('changeCursor');
    };
  }, []);

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
