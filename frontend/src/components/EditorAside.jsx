import React, { useState } from 'react'
import Client from './Client'
import Avatar from 'react-avatar'

const EditorAside = ({username,clients,leaveRoom,copyRoom}) => {
    // const [clients,setClients]=useState([
    //     {socketId:1,username:'Abhis k'}
    // ])




    
    
  return (
        <div className=' w-[20%] h-screen p-4 border-r-4 border-r-white aside'>
        <div className=''>
          <div className='logo'>
            <img className='w-50 h-20' src="/code-sync.png" alt="" />
          </div>
          <div className='border border-[#eeefff] rounded my-2'></div>
          <h3 className='font-mono text-2xl my-5 font-bold '>Connected</h3>
          <div className=' h-[67vh]'>
            <div className='flex flex-wrap w-auto  '>
            {
                clients.map((client)=>{
                  return  <Client key={client.socketId} username={client.username}/>
                })
            }
            </div>
          </div>
        </div>
        <div className=' my-4'>
            <button
            onClick={copyRoom}
             className=' mb-5 w-full bg-white rounded-lg text-black font-sans font-semibold px-2 py-1 text-xl hover:bg-slate-200 active:bg-slate-300'>Copy Room ID</button>
            <button 
            onClick={leaveRoom}
            className=' w-full bg-[#4aed88] rounded-lg text-black font-sans font-semibold px-2 py-1 text-xl hover:bg-green-500 active:bg-green-600'>Leave Room</button>
        </div>
    </div>
  )
}

export default EditorAside