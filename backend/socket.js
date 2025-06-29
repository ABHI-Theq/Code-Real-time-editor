import { Server } from 'socket.io';
import app from './app.js';
import { createServer } from 'http';

const server = createServer(app);
const port = process.env.PORT || 3301;
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with actual frontend domain
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = new Map();
const roomData = new Map();
const editorContentMap = new Map();
const userRoomMap = new Map(); // Track which room each user is in
const userCursors = new Map(); // Track user cursor positions

io.on('connection', (socket) => {
  console.log('A user connected: ', socket.id);

  // Handle user joining a room
  socket.on('user-joined-room', (data) => {
    if (!data.roomId || !data.username) {
      socket.emit('error', 'Invalid room or username');
      return;
    }

    // Check if user is already in this room
    const existingRoom = userRoomMap.get(data.username);
    if (existingRoom === data.roomId) {
      socket.emit('error', 'You are already in this room');
      return;
    }

    // Check if user is already in a different room
    if (existingRoom && existingRoom !== data.roomId) {
      // Leave the previous room first
      socket.leave(existingRoom);
      if (roomData.has(existingRoom)) {
        const users = roomData.get(existingRoom);
        roomData.set(existingRoom, users.filter((user) => user.username !== data.username));
        
        // Reset editor content if all users have left the previous room
        if (roomData.get(existingRoom).length === 0) {
          editorContentMap.set(existingRoom, "console.log('hello world')");
        }
        
        const remainingClients = roomData.get(existingRoom);
        io.to(existingRoom).emit('user-left', { 
          username: data.username, 
          socketId: socket.id, 
          clients: remainingClients 
        });
      }
    }

    // Update user mappings
    userSocketMap.set(data.username, socket.id);
    userRoomMap.set(data.username, data.roomId);
    socket.join(data.roomId);

    if (!roomData.has(data.roomId)) {
      roomData.set(data.roomId, []);
      // Set default content for new room
      editorContentMap.set(data.roomId, "console.log('hello world')");
    }

    // Remove any existing user with the same username to avoid duplicates
    const users = roomData.get(data.roomId).filter(user => user.username !== data.username);
    users.push({ username: data.username, socketId: socket.id });
    roomData.set(data.roomId, users);

    // Send the current editor content to the newly joined user
    const currentContent = editorContentMap.get(data.roomId) || '';
    socket.emit('sending-updated-content', { content: currentContent });

    const clients = roomData.get(data.roomId);
    io.to(data.roomId).emit('user-joined', { username: data.username, socketId: socket.id, clients });
  });

  // Handle cursor position updates
  socket.on('cursor-position', (data) => {
    const { roomId, username, position } = data;
    if (!roomId || !username || !position) return;

    // Store cursor position
    const roomCursors = userCursors.get(roomId) || new Map();
    roomCursors.set(username, position);
    userCursors.set(roomId, roomCursors);

    // Broadcast cursor position to other users in the room (not to sender)
    socket.broadcast.to(roomId).emit('user-cursor-position', {
      username,
      position
    });

    // Broadcast typing indicator to other users in the room (not to sender)
    socket.broadcast.to(roomId).emit('user-typing', { username });
  });

  // Handle typing stopped
  socket.on('typing-stopped', (data) => {
    const { roomId, username } = data;
    if (!roomId || !username) return;

    // Broadcast typing stopped to other users in the room (not to sender)
    socket.broadcast.to(roomId).emit('user-stopped-typing', { username });
  });

  // Handle code execution
  socket.on("run-code", (data) => {
    const { content, roomId } = data;
    io.to(roomId).emit("executed-code", { content, roomId });
  });

  // Handle group messages
  socket.on('GroupMessage', (data) => {
    const { message, username, roomId } = data;
    io.to(roomId).emit('new-message', { message, username, roomId, time: Date.now(), socketId: socket.id });
  });

  // Handle user leaving a room
  socket.on('leaveRoom', (data) => {
    if (!data.roomId || !data.username) {
      socket.emit('error', 'Invalid room or username');
      return;
    }

    socket.leave(data.roomId);
    
    // Remove from user mappings
    userRoomMap.delete(data.username);

    // Remove cursor data
    const roomCursors = userCursors.get(data.roomId);
    if (roomCursors) {
      roomCursors.delete(data.username);
      if (roomCursors.size === 0) {
        userCursors.delete(data.roomId);
      }
    }

    if (roomData.has(data.roomId)) {
      const users = roomData.get(data.roomId);
      roomData.set(data.roomId, users.filter((user) => user.username !== data.username));

      // Reset editor content if all users have left the room
      if (roomData.get(data.roomId).length === 0) {
        editorContentMap.set(data.roomId, "console.log('hello world')");
      }
    }

    const clients = roomData.get(data.roomId);
    io.to(data.roomId).emit('user-left', { username: data.username, socketId: socket.id, clients });
  });

  // Handle editor content updates
  socket.on('editor-update', (data) => {
    if (!data.roomId) {
      socket.emit('error', 'Invalid room');
      return;
    }

    // Update the editor content map
    editorContentMap.set(data.roomId, data.content);
    socket.broadcast.to(data.roomId).emit("sending-updated-content", { content: data.content });
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const username = [...userSocketMap.entries()].find(
      ([, id]) => id === socket.id
    )?.[0];

    if (username) {
      userSocketMap.delete(username);
      const roomId = userRoomMap.get(username);
      userRoomMap.delete(username);
      
      // Remove cursor data
      if (roomId) {
        const roomCursors = userCursors.get(roomId);
        if (roomCursors) {
          roomCursors.delete(username);
          if (roomCursors.size === 0) {
            userCursors.delete(roomId);
          }
        }
      }
      
      console.log(`User ${username} disconnected`);

      if (roomId && roomData.has(roomId)) {
        const users = roomData.get(roomId);
        roomData.set(roomId, users.filter((user) => user.username !== username));
        
        // Reset editor content if all users have left the room
        if (roomData.get(roomId).length === 0) {
          editorContentMap.set(roomId, "console.log('hello world')");
        }
        
        const remainingClients = roomData.get(roomId);
        io.to(roomId).emit('user-left', { 
          username: username, 
          socketId: socket.id, 
          clients: remainingClients 
        });
      }
    } else {
      console.log('A user disconnected');
    }
  });
});

export default server;