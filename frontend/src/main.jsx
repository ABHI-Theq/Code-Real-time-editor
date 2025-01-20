import { StrictMode } from 'react'
import {Toaster} from 'react-hot-toast'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { SocketContextProvider } from './context/SocketContext.jsx'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
    <SocketContextProvider>
    <Toaster/>
    <App />
    </SocketContextProvider>
    </BrowserRouter>
)
