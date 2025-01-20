import React from 'react'
import Avatar from 'react-avatar'
const Client = ({username}) => {
  return (
    <div className='text-white flex flex-col p-3 '>
        <Avatar name={`${username}`} size={50} round={"10px"}/>
        <span className='mt-2'>{username}</span>
    </div>
  )
}

export default Client