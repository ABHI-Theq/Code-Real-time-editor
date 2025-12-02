import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

// Custom hook for using the socket context
export const useSocket = () => {
  return useContext(SocketContext);
};

// Socket Context Provider
export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const socketUrl = import.meta.env.VITE_API_SOCKET_URL


  useEffect(() => {
    if (!socket) {
      // Initialize socket connection with optimizations for low latency
      const socketInstance = io(socketUrl, {
        transports: ['websocket', 'polling'], // Prefer WebSocket
        upgrade: true,
        rememberUpgrade: true,
        reconnection: true,
        reconnectionDelay: 500,
        reconnectionDelayMax: 3000,
        reconnectionAttempts: 5,
        timeout: 20000,
        autoConnect: true,
        // Performance optimizations
        forceNew: false,
        multiplex: true,
        perMessageDeflate: false, // Disable compression for lower latency
        withCredentials: false,
        path: '/socket.io/',
      });

      // When socket is successfully connected
      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
        setSocket(socketInstance);
        setIsLoading(false);  // Set loading to false when socket is ready
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Cleanup on component unmount
      return () => {
          // if (socketInstance) {
          //   socketInstance.disconnect();
          // }
      };
    }
  }, [socket, socketUrl]);  // Only re-run when the socket is not initialized

  if (isLoading) {
    return <div>Loading...</div>;  // Show loading message or spinner
  }

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
