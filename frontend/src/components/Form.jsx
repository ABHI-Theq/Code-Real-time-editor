    import React, { useState } from 'react';
    import axios from 'axios';
    import toast from 'react-hot-toast';
    import {v4 as uuidv4} from 'uuid'
    import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

    const Form = () => {
        const [roomId, setRoomId] = useState("");
        const [username, setUsername] = useState("");
        const navigate=useNavigate();
        const {socket}=useSocket();

        const getId =  (e) => {
            const id=uuidv4()
            setRoomId(id)
            // console.log(id);
            toast.success("Created new room id")
            
        }

        const handleSubmit = (e) => {
            e.preventDefault();  // Prevent form from reloading the page
            if (!roomId || !username) {
                toast.error('Please fill in both fields.');
                return;
            }

            if(roomId.length<6){
                toast.error('Room id must be at least 6 characters long.');
                return;
            }
            navigate(`/editor/${roomId}?username=${username}&roomId=${roomId}`)



            // console.log('Form Submitted:', { roomId, username });
        };

        return (
            <div className='w-[45%] h-[45%] p-4 bg-[#1b2921] rounded-2xl relative'>
                <img src="/code-sync.png" className='w-30 h-30 mb-5' alt="Code Sync Logo" />
                <form onSubmit={handleSubmit} className='p-4 w-full'>
                    {/* Room ID Input */}
                    <input
                        className='w-full mt-2 mb-8 p-2 rounded-lg text-xl text-black'
                        type="text"
                        name="roomId"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder='ROOM ID'
                        required
                    />
                    
                    {/* Username Input */}
                    <input
                        className='w-full mb-2 p-2 rounded-lg text-black text-xl'
                        type="text"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder='USERNAME'
                        required
                    />
                    
                    {/* Create Room Link */}
                    <p className='text-white mx-auto'>
                        If you don't have a room ID &nbsp;
                        <span
                            className='underline text-blue-600 cursor-pointer'
                            onClick={getId}
                        >
                            create one
                        </span>.
                    </p>
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className='absolute bottom-10 right-10 text-2xl font-bold bg-green-500 text-white px-4 py-2 rounded-lg'
                    >
                        Enter
                    </button>
                </form>
            </div>
        );
    };

    export default Form;
