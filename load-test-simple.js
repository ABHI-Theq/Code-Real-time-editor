// Simple Socket.IO Latency Test
// Run: node load-test-simple.js

import { io } from 'socket.io-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3301';
const NUM_USERS = 5;
const ROOM_ID = 'test-room-' + Date.now();

console.log('🚀 Simple Socket.IO Latency Test');
console.log(`📊 Testing with ${NUM_USERS} concurrent users\n`);

const connections = [];
const results = [];

// Create connections
for (let i = 0; i < NUM_USERS; i++) {
  const username = `User${i + 1}`;
  
  const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    upgrade: false,
  });

  socket.on('connect', () => {
    console.log(`✅ ${username} connected`);
    socket.emit('user-joined-room', { username, roomId: ROOM_ID });
  });

  connections.push({ socket, username, latencies: [] });
}

// Wait for connections, then test
setTimeout(() => {
  console.log('\n📝 Measuring round-trip latency...\n');
  
  let testsCompleted = 0;
  const TESTS_PER_USER = 20;
  
  connections.forEach(({ socket, username, latencies }) => {
    let testCount = 0;
    
    const runTest = () => {
      if (testCount >= TESTS_PER_USER) {
        testsCompleted++;
        
        // Calculate stats for this user
        const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        const min = Math.min(...latencies);
        const max = Math.max(...latencies);
        
        results.push({ username, avg, min, max, latencies });
        console.log(`${username}: avg=${avg.toFixed(2)}ms, min=${min}ms, max=${max}ms`);
        
        // If all tests done, show summary
        if (testsCompleted === NUM_USERS) {
          showSummary();
        }
        return;
      }
      
      const startTime = Date.now();
      
      // Send update and measure time until we receive it back
      const testContent = `Test ${testCount} from ${username}`;
      socket.emit('editor-update', { content: testContent, roomId: ROOM_ID });
      
      // Listen for any update (including our own echo)
      const listener = () => {
        const latency = Date.now() - startTime;
        latencies.push(latency);
        socket.off('sending-updated-content', listener);
        
        testCount++;
        setTimeout(runTest, 100); // Wait 100ms between tests
      };
      
      socket.on('sending-updated-content', listener);
    };
    
    runTest();
  });
}, 2000);

function showSummary() {
  console.log('\n📊 Overall Results:');
  console.log('═══════════════════════════════════════');
  
  const allLatencies = results.flatMap(r => r.latencies);
  const overallAvg = allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length;
  const overallMin = Math.min(...allLatencies);
  const overallMax = Math.max(...allLatencies);
  
  // Calculate P95
  const sorted = allLatencies.sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  
  console.log(`Total Measurements: ${allLatencies.length}`);
  console.log(`\nLatency Statistics:`);
  console.log(`   Average: ${overallAvg.toFixed(2)}ms`);
  console.log(`   Median: ${sorted[Math.floor(sorted.length / 2)]}ms`);
  console.log(`   Min: ${overallMin}ms`);
  console.log(`   Max: ${overallMax}ms`);
  console.log(`   P95: ${p95}ms`);
  console.log(`   P99: ${p99}ms`);
  
  if (overallAvg < 90) {
    console.log(`\n✅ EXCELLENT: Average latency (${overallAvg.toFixed(2)}ms) is below 90ms target!`);
  } else if (overallAvg < 150) {
    console.log(`\n⚠️  ACCEPTABLE: Average latency (${overallAvg.toFixed(2)}ms) is slightly above target`);
  } else {
    console.log(`\n❌ NEEDS OPTIMIZATION: Average latency (${overallAvg.toFixed(2)}ms) is too high`);
  }
  
  console.log('═══════════════════════════════════════\n');
  
  // Cleanup
  connections.forEach(({ socket, username }) => {
    socket.emit('leaveRoom', { username, roomId: ROOM_ID });
    socket.disconnect();
  });
  
  process.exit(0);
}

// Timeout safety
setTimeout(() => {
  console.log('\n⏱️  Test timeout - exiting');
  process.exit(1);
}, 60000);
