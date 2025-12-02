// Keep-Alive Script to Prevent Render Cold Starts
// Run this on a free service like cron-job.org or GitHub Actions

import https from 'https';

const BACKEND_URL = 'https://code-real-time-editor.onrender.com';

function pingServer() {
  const startTime = Date.now();
  
  https.get(BACKEND_URL, (res) => {
    const latency = Date.now() - startTime;
    console.log(`✅ Ping successful - Status: ${res.statusCode} - Latency: ${latency}ms`);
  }).on('error', (err) => {
    console.error(`❌ Ping failed:`, err.message);
  });
}

// Ping every 10 minutes (Render free tier sleeps after 15 min)
console.log('🚀 Keep-Alive Service Started');
console.log(`📍 Target: ${BACKEND_URL}`);
console.log('⏰ Pinging every 10 minutes...\n');

pingServer(); // Initial ping
setInterval(pingServer, 10 * 60 * 1000); // Every 10 minutes
