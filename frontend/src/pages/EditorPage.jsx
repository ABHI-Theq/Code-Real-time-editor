import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EditorAside from '../components/EditorAside';
import CodeEditor from '../components/RealEditor';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import playButton from '../assets/play_button.png'; // Import the play button image
import down from '../assets/down.png';

const EditorPage = () => {
  const [searchParams] = useSearchParams();
  const username = searchParams?.get('username');
  const roomId = searchParams?.get('roomId');
  const { socket } = useSocket();
  const [editorContent, setEditorContent] = useState("console.log('hello world')");
  const [executionResult, setExecutionResult] = useState('');
  const navigate = useNavigate();
  const [output, setOutput] = useState(false);
  const [userData, setUserData] = useState([
    {
      username: '12344',
      socketId: 'Abhis',
    }
  ]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      toast.success("roomId Copied successfully");
    })
    .catch((e) => {
      toast.error(e.message);
    });
  };

  const leaveRoom = () => {
    socket.emit('leaveRoom', { username, roomId });
    socket.disconnect();
    navigate('/home');
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
      setOutput(true);
      console.log = originalConsoleLog;
      setExecutionResult(log.join('\n'));
    } catch (error) {
      setExecutionResult(error.message);
    }
  };

  useEffect(() => {
    if (username && roomId) {
      socket.emit("user-joined-room", { username, roomId });
    }

    socket.on('user-joined', (data) => {
      // console.log(data);
      setUserData(data.clients);
      toast.success(`${data.username} joined the room`);
    });

    socket.on('user-left', (data) => {
      console.log(data);
      setUserData(data.clients);
      toast.success(`${data.username} left the room`);
    });

    socket.on("sending-updated-content", (data) => {
      // console.log(data.content);
      setEditorContent(data.content);
    });

    const handleBeforeUnload = (event) => {
      const message = "You have unsaved changes. Are you sure you want to leave?";
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      socket.off('user-joined');
      socket.off('user-left');
      socket.off("sending-updated-content");
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.emit('leaveRoom', { username, roomId });
    };
  }, [socket, username, roomId]);

  return (
    <div className='bg-[#2a2b2c] w-full h-screen text-white flex '>
      <EditorAside username={username} clients={userData} leaveRoom={leaveRoom} copyRoom={copyToClipboard} />
      <div className='w-[80%] h-screen py-4 scrollbar-content thin-scrollbar rounded-2xl '>
        <CodeEditor
          handleEditorChange={handleEditorChange}
          editorContent={editorContent}
        />
        <div className='absolute top-10 right-10 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex justify-center items-center cursor-pointer' onClick={executeCode}>
          <img className='w-6 h-6' src={playButton} alt="Run Code" />
        </div>
        <div className={`mx-4 w-[78%] absolute rounded-lg transition-all duration-500 ease-in-out  h-14 ${output ? 'h-[40%]' : 'h-14'}  bottom-0 left-100 z-10  bg-gray-800 p-4 overflow-y-auto`}>
          <div className='w-6 absolute right-4 rounded-lg invert hover:bg-gray-100'>
            <img className={`w-6 h-6`} src={down} alt="" onClick={() => setOutput(false)} />
          </div>
          <h3 className='text-xl font-bold'>Output:</h3>
          <pre>{executionResult}</pre>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
