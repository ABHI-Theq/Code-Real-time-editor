import { createContext, useContext, useEffect, useState, useMemo } from "react";
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
  const socketUrl = import.meta.env.VITE_API_SOCKET_URL;

  useEffect(() => {
    // Only initialize if socket doesn't exist
    if (!socket) {
      const socketInstance = io(socketUrl, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        reconnection: true,
        reconnectionDelay: 500,
        reconnectionDelayMax: 3000,
        reconnectionAttempts: 5,
        timeout: 20000,
        autoConnect: true,
        forceNew: false,
        multiplex: true,
        perMessageDeflate: false, 
        withCredentials: false,
        path: '/socket.io/',
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
        setSocket(socketInstance);
        setIsLoading(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Cleanup on component unmount
      return () => {
        socketInstance.off('connect');
        socketInstance.off('connect_error');
        // socketInstance.disconnect(); // Uncomment if you want to hard close on unmount
      };
    }
  }, [socketUrl]); // Removed 'socket' from deps to avoid re-triggering logic when socket is set

  // Memoize the context value to prevent unnecessary downstream re-renders
  const contextValue = useMemo(() => ({
    socket,
    isLoading
  }), [socket, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};