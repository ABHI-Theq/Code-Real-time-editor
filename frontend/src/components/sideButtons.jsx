import React from 'react'
import team from '../assets/team.png';
const sideButtons = () => {
  return (
    <div className='w-[6%] h-screen  py-4  px-2 border-r-4 border-r-slate-200 bg-gray-800  flex flex-col items-center justify-start gap-y-4'>
            
                   <div name="group chat" className='w-16 h-16 bg-blue-500 hover:bg-blue-600 p-2 rounded-xl'>
                     <img className=' invert' src={team} alt="" />
                   </div>
                   <div name="group chat" className='w-16 h-16 bg-blue-500 hover:bg-blue-600 p-2 rounded-xl'>
                     <img className=' invert' src={groupChat} alt="" />
                   </div>
         </div>
  )
}

export default sideButtons