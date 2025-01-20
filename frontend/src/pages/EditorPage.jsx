import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EditorAside from '../components/EditorAside';
import CodeEditor from '../components/RealEditor';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const EditorPage = () => {
  const [searchParams] = useSearchParams();
  const username = searchParams?.get('username');
  const roomId = searchParams?.get('roomId');
  const { socket } = useSocket();
  const [editorContent,setEditorContent]=useState("console.log('hello world')")
  const navigate=useNavigate()
  const [userData, setUserData] = useState(
    [
      {
    username: '12344',
    socketId: 'Abhis',
      }
    ]
  );

  const copyToClipboard=()=>{
    navigator.clipboard.writeText(roomId).then(() => {
      toast.success("roomId Copied successfully")
    })
    .catch((e)=>{
      toast.error(e.message)
    })
  }

  const leaveRoom=()=>{
    socket.emit('leaveRoom', { username, roomId });
    socket.disconnect();
    navigate('/home')
  }

  const handleEditorChange = (newValue) => {
    setEditorContent(newValue)
      // console.log("Editor content changed:", newValue);
      socket.emit('editor-update',{content:newValue,roomId:roomId})

    };



  // Emit "user-joined-room" only once when the component is mounted
  useEffect(() => {
    if (username && roomId) {
      socket.emit("user-joined-room", { username, roomId });
    }

    socket.on('user-joined', (data) => {
      console.log(data);
      setUserData(data.clients)
      toast.success(`${data.username} joined the room`);
    });

    socket.on('user-left', (data) => {
      console.log(data);
      setUserData(data.clients)
      toast.success(`${data.username} left the room`);
    });

    socket.on("sending-updated-content",(data)=>{
      console.log(data.content);
      setEditorContent(data.content)
    })


    const handleunload=(event)=>{
      console.log(event);
      
    }


    // Handle the tab or browser closing event
    const handleBeforeUnload = (event) => {
      // Customize the message as per your requirement
      const message = "You have unsaved changes. Are you sure you want to leave?";

      
      // If you want to display a confirmation dialog:
      event.returnValue = message; // For most browsers
      // if(event){
      //   socket.emit('leaveRoom', { username, roomId });
      // }
      return message; // For some older browsers
      }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleunload);

    // Cleanup
    return () => {
      socket.off('user-joined', (data) => {
        console.log(data);
        setUserData((e)=>{
          return [...e,data]
        });
        toast.success(`${data.username} joined the room`);
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleunload);
      socket.emit('leaveRoom', { username, roomId });
      socket.off('user-left', (data) => {
        console.log(data);
        setUserData((e)=>{
          return e.filter((user) => user.socketId !== data.socketId)
        })
        toast.success(`${data.username} left the room`);
      });
      socket.off("sending-updated-content")
  
    };
  }, [socket, username, roomId]); // Only run the effect when `username` or `roomId` changes

  return (
    <div className='bg-[#2a2b2c] w-full h-screen text-white flex justify-center items-center'>
      <EditorAside username={username} clients={userData} leaveRoom={leaveRoom} copyRoom={copyToClipboard}/>
      <div className='w-[80%] h-screen py-4 scrollbar-content thin-scrollbar rounded-2xl'>
        <CodeEditor handleEditorChange={handleEditorChange} editorContent={editorContent}/>
      </div>
    </div>
  );
};

export default EditorPage;
