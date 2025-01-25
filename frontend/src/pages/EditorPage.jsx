import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EditorAside from '../components/EditorAside';
import CodeEditor from '../components/RealEditor';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import playButton from '../assets/play_button.png'; // Import the play button image
import down from '../assets/down.png';
import Chat from '../components/Chat';
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
  const [messages,setMessages]=useState([])
  const [output, setOutput] = useState(false);
  const [editoraside,setEditoraside] = useState(true);
  const [chatsection,setChatsection] = useState(false);
  const [userData, setUserData] = useState([
    {
      username: '',
      socketId: '',
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
      console.log = originalConsoleLog;
      setOutput(true); 
      setExecutionResult(log.join('\n'));
    } catch (error) {
      setExecutionResult(error.message);
    }finally{

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

    socket.on('new-message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      console.log(messages);
      
    });
    const handleBeforeUnload = (event) => {
      const message = "You have unsaved changes. Are you sure you want to leave?";
      event.returnValue = message;

      // Emit leaveRoom event if the user confirms they want to leave or close the window
      if (window.confirm(message)) {
        socket.emit('leaveRoom', { username, roomId });
      }

      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', () => {
      socket.emit('leaveRoom', { username, roomId });
    });

    return () => {
      socket.off('user-joined');
      socket.off('user-left');
      socket.off("sending-updated-content");
      socket.off('new-message');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', () => {
        socket.emit('leaveRoom', { username, roomId });
      });
      socket.emit('leaveRoom', { username, roomId });
    };
  }, [socket, username, roomId]);

  return (
    <div className='bg-[#2a2b2c] w-full h-screen text-white flex '>
      <div className='w-[6%] h-screen  py-4  px-2 border-r-4 border-r-slate-200 bg-gray-800  flex flex-col items-center justify-start gap-y-4'>
         
                <div name="group members" 
                onClick={()=>{setEditoraside(true);setChatsection(false)}}
                className='w-16 h-16 bg-blue-500 hover:bg-blue-600 p-2 rounded-xl'>
                  <img className=' invert' src={team} alt="" />
                </div>
                <div name="group chat"
             onClick={()=>{setEditoraside(false);setChatsection(true)}}
                 className='w-16 h-16 bg-blue-500 hover:bg-blue-600 p-2 rounded-xl'>
                  <img className=' invert' src={groupChat} alt="" />
                </div>
      </div>
      { editoraside && <EditorAside username={username} clients={userData} leaveRoom={leaveRoom} copyRoom={copyToClipboard} />}
      { chatsection &&  <Chat username={username} roomId={roomId} messages={messages} />}
      <div className='w-[74%] h-screen py-4 scrollbar-content thin-scrollbar rounded-2xl '>
        <CodeEditor
          handleEditorChange={handleEditorChange}
          editorContent={editorContent}
        />
        <div className='absolute top-10 right-10 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex justify-center items-center cursor-pointer' onClick={executeCode}>
          <img className='w-6 h-6' src={playButton} alt="Run Code" />
        </div>
        <div className={`mx-4 w-[70%] absolute rounded-lg transition-all duration-500 ease-in-out  h-12 ${output ? 'h-[40%]' : 'h-12'}  bottom-0 left-100 z-10  bg-gray-800 p-4 overflow-y-auto`}>
          <div className='w-6 absolute right-4 rounded-lg invert hover:bg-gray-100'>
            <img className={`w-6 h-6`} src={down} alt="" onClick={() => setOutput(false)} />
          </div>
          <h3 className='text-xl font-bold'>Output:</h3>
          <pre>{executionResult}</pre>
          <pre className='text-center'>--------------------------------Code Compilation Output--------------------------------</pre>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
