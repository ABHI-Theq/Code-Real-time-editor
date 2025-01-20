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

io.on('connection', (socket) => {
  console.log('A user connected: ', socket.id);

  socket.on('user-joined-room', (data) => {
    if (!data.roomId || !data.username) {
      socket.emit('error', 'Invalid room or username');
      return;
    }

    userSocketMap.set(data.username, socket.id);
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

  socket.on('leaveRoom', (data) => {
    if (!data.roomId || !data.username) {
      socket.emit('error', 'Invalid room or username');
      return;
    }

    socket.leave(data.roomId);

    if (roomData.has(data.roomId)) {
      const users = roomData.get(data.roomId);
      roomData.set(data.roomId, users.filter((user) => user.username !== data.username));
    }

    const clients=roomData.get(data.roomId)

    io.to(data.roomId).emit('user-left', { username: data.username, socketId: socket.id ,clients});
  });

  socket.on('editor-update', (data) => {
    if (!data.roomId) {
      socket.emit('error', 'Invalid room');
      return;
    }

    // Update the editor content map
    editorContentMap.set(data.roomId, data.content);
    socket.broadcast.to(data.roomId).emit("sending-updated-content", { content: data.content });
  });

  socket.on('disconnect', () => {
    const username = [...userSocketMap.entries()].find(
      ([, id]) => id === socket.id
    )?.[0];

    if (username) {
      userSocketMap.delete(username);
      console.log(`User ${username} disconnected`);

      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) {
          io.to(roomId).emit('user-left', `${username} left the room`);
        }
      }
    } else {
      console.log('A user disconnected');
    }
  });
});

export default server;
