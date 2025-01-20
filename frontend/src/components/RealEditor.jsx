import React from 'react';
import AceEditor from 'react-ace';

// Import Ace modes and themes
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';

const CodeEditor = ({handleEditorChange,editorContent}) => {
  // const handleEditorChange = (newValue) => {
  //   console.log("Editor content changed:", newValue);
  // };

  return (
    <div>
      <AceEditor className=''
        mode="javascript"             // Set the language mode
        theme="monokai"               // Set the theme
        name="code-editor"            // Give the editor a unique name
        value={editorContent}
        onChange={handleEditorChange} // Handle changes in the editor
        editorProps={{ $blockScrolling: true }} // Prevent the "block scrolling" warning
        width="100%"                  // Set editor width
        height="98vh"                // Set editor height
        fontSize={16}                 // Set font size
        showGutter={true}             // Show line numbers
        highlightActiveLine={true}    // Highlight the current line
        setOptions={{
          enableBasicAutocompletion: true,  // Enable autocompletion
          enableLiveAutocompletion: true,   // Enable live autocompletion
          enableSnippets: true,             // Enable code snippets
        }}
      />
    </div>
  );
};

export default CodeEditor;
