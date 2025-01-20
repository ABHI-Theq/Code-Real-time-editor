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

  useEffect(() => {
    if (!socket) {
      // Initialize socket connection if not already initialized
      const socketInstance = io('http://localhost:3301');

      // When socket is successfully connected
      socketInstance.on('connect', () => {
        setSocket(socketInstance);
        setIsLoading(false);  // Set loading to false when socket is ready
      });

      // Cleanup on component unmount
      return () => {
          // if (socketInstance) {
          //   socketInstance.disconnect();
          // }
      };
    }
  }, [socket]);  // Only re-run when the socket is not initialized

  if (isLoading) {
    return <div>Loading...</div>;  // Show loading message or spinner
  }

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
