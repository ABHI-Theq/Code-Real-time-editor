import React from 'react'
import Form from '../components/Form'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className=' bg-[#1c1e29] flex justify-center items-center w-full h-screen'>
    <Form/>
    <p className='absolute bottom-0 text-2xl text-white '>
     🌟 Build by <Link to={`https://github.com/ABHI-Theq/`} className='text-green-600 underline hover:text-green-500'>Abhishek Sharma</Link> 🌟
    </p>
    </div>
  )
}

export default Home