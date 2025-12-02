// Socket.IO Load Testing Script
// Run: node load-test-socketio.js

import { io } from 'socket.io-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
console.log(process.env.SOCKET_URL);

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3301';
const NUM_USERS = 5;
const TEST_DURATION = 30000; // 30 seconds
const ROOM_ID = 'test-room-' + Date.now();

const latencies = [];
const connections = [];

console.log('🚀 Starting Socket.IO Load Test');
console.log(`📊 Configuration:`);
console.log(`   - URL: ${SOCKET_URL}`);
console.log(`   - Concurrent Users: ${NUM_USERS}`);
console.log(`   - Test Duration: ${TEST_DURATION / 1000}s`);
console.log(`   - Room ID: ${ROOM_ID}\n`);

// Create multiple user connections
for (let i = 0; i < NUM_USERS; i++) {
  const username = `User${i + 1}`;
  
  const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    upgrade: false,
    reconnection: false,
  });

  socket.on('connect', () => {
    console.log(`✅ ${username} connected (${socket.id})`);
    
    // Join room
    socket.emit('user-joined-room', { username, roomId: ROOM_ID });
  });

  socket.on('user-joined', (data) => {
    console.log(`👥 ${data.username} joined room (${data.clients.length} users)`);
  });

  // Measure latency for editor updates
  socket.on('sending-updated-content', (data) => {
    if (data.timestamp) {
      const latency = Date.now() - data.timestamp;
      if (latency >= 0 && latency < 10000) { // Sanity check
        latencies.push(latency);
        if (latencies.length % 50 === 0) {
          const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
          console.log(`   📈 ${latencies.length} messages received, avg latency: ${avg.toFixed(2)}ms`);
        }
      }
    }
  });

  socket.on('connect_error', (error) => {
    console.error(`❌ ${username} connection error:`, error.message);
  });

  connections.push({ socket, username });
}

// Wait for all connections to establish
setTimeout(() => {
  console.log('\n📝 Starting editor synchronization test...\n');
  
  let updateCount = 0;
  
  // Simulate typing - send updates every 100ms
  const typingInterval = setInterval(() => {
    const randomUser = connections[Math.floor(Math.random() * connections.length)];
    const content = `console.log("Update ${updateCount++} from ${randomUser.username}");`;
    const timestamp = Date.now();
    
    randomUser.socket.emit('editor-update', { 
      content, 
      roomId: ROOM_ID,
      timestamp // Add timestamp to measure latency
    });
  }, 100);

  // Stop test after duration
  setTimeout(() => {
    clearInterval(typingInterval);
    
    console.log('\n📊 Test Results:');
    console.log('═══════════════════════════════════════');
    
    if (latencies.length > 0) {
      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const minLatency = Math.min(...latencies);
      const maxLatency = Math.max(...latencies);
      const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];
      
      console.log(`Total Updates: ${updateCount}`);
      console.log(`Messages Received: ${latencies.length}`);
      console.log(`\nLatency Statistics:`);
      console.log(`   Average: ${avgLatency.toFixed(2)}ms`);
      console.log(`   Min: ${minLatency}ms`);
      console.log(`   Max: ${maxLatency}ms`);
      console.log(`   P95: ${p95Latency}ms`);
      
      if (avgLatency < 90) {
        console.log(`\n✅ PASSED: Average latency (${avgLatency.toFixed(2)}ms) is below 90ms target`);
      } else {
        console.log(`\n⚠️  WARNING: Average latency (${avgLatency.toFixed(2)}ms) exceeds 90ms target`);
      }
    } else {
      console.log('❌ No latency data collected');
    }
    
    console.log('═══════════════════════════════════════\n');
    
    // Cleanup
    connections.forEach(({ socket, username }) => {
      socket.emit('leaveRoom', { username, roomId: ROOM_ID });
      socket.disconnect();
    });
    
    process.exit(0);
  }, TEST_DURATION);
}, 2000);
