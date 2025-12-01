# 🔧 Technical Guide

Complete guide for code execution, multi-user collaboration, security, and troubleshooting.

---

## Table of Contents

1. [Code Execution Setup](#code-execution-setup)
2. [Multi-User Editing Logic](#multi-user-editing-logic)
3. [Security Implementation](#security-implementation)
4. [Production Deployment](#production-deployment)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Code Execution Setup

### Default Setup (No Configuration Required)

The application uses **Piston API** by default:
- ✅ **Completely FREE**
- ✅ **No API key required**
- ✅ **No registration needed**
- ✅ **Supports 15+ languages**
- ✅ **Works out of the box**

**You don't need to do anything!** Just run the application and code execution works automatically.

### How It Works

```
User clicks "Run Code"
        ↓
Frontend sends code to backend
        ↓
Backend tries Piston API (free)
        ↓
If Piston fails AND Judge0 key exists
        ↓
Backend tries Judge0 API
        ↓
Results sent back to frontend
```

### Optional: Judge0 API Setup

Judge0 offers more features like execution time tracking and better resource limits. It's **optional** and requires a RapidAPI account.

#### Step 1: Get Judge0 API Key

1. Go to [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Click "Sign Up" (free tier available)
3. Subscribe to the **Basic Plan** (free tier: 50 requests/day)
4. Copy your API key from the dashboard

#### Step 2: Configure Backend

Edit `backend/.env`:

```env
# Replace 'your_rapidapi_key_here' with your actual API key
JUDGE0_API_KEY=your_actual_api_key_from_rapidapi
```

#### Step 3: Restart Backend

```bash
cd backend
npm run dev
```

**That's it!** The system will automatically use Judge0 when available, falling back to Piston if needed.

### Environment Configuration

**Backend (`backend/.env`)**:
```env
# Server Port
PORT=3301

# Environment
NODE_ENV=development

# Code Execution APIs
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here  # Optional
PISTON_API_URL=https://emkc.org/api/v2/piston

# Security Limits
MAX_CODE_LENGTH=10000           # Max characters in code
EXECUTION_TIMEOUT=30000         # 30 seconds max execution
RATE_LIMIT_WINDOW=60000         # 1 minute window
RATE_LIMIT_MAX_REQUESTS=10      # 10 requests per window

# CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend (`frontend/.env`)**:
```env
# Backend API URL
VITE_API_URL=http://localhost:3301

# Socket.IO URL (usually same as API)
VITE_SOCKET_URL=http://localhost:3301
```

---

## 👥 Multi-User Editing Logic

### How Real-Time Collaboration Works

When multiple users edit code simultaneously, the system uses **Operational Transformation (OT)** principles with a **Last Write Wins (LWW)** strategy.

### 1. Optimistic Updates

```javascript
User types → Local editor updates immediately → Broadcast to others
```

Each user sees their own changes instantly without waiting for server confirmation.

### 2. Conflict Resolution Strategy

**Last Write Wins (LWW)** - The most recent edit takes precedence.

```
Timeline:
T1: User A types "hello"     → All users see "hello"
T2: User B types "world"     → All users see "world"
T3: User A types "!"         → All users see "!"
```

### 3. Detailed Flow Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   User A    │         │   Server    │         │   User B    │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │ Types "hello"         │                       │
       ├──────────────────────>│                       │
       │ (editor-update)       │                       │
       │                       │                       │
       │                       ├──────────────────────>│
       │                       │ (sending-updated-     │
       │                       │  content: "hello")    │
       │                       │                       │
       │                       │       Types "world"   │
       │                       │<──────────────────────┤
       │                       │ (editor-update)       │
       │                       │                       │
       │<──────────────────────┤                       │
       │ (sending-updated-     │                       │
       │  content: "world")    │                       │
       │                       │                       │
```

### 4. Typing Indicators

To prevent confusion, the system shows who's typing:

```javascript
// When User A types
socket.emit('user-typing', { roomId, username: 'User A' })

// Other users see
"User A is typing..." (with color-coded indicator)

// After 2 seconds of inactivity
socket.emit('typing-stopped', { roomId, username: 'User A' })
```

### 5. Handling Race Conditions

**Scenario: Two users type at the exact same time**

```javascript
// Server receives both edits within milliseconds
T1: User A sends "hello"
T2: User B sends "world"

// Server processes in order received
1. Stores "hello" in editorContentMap
2. Broadcasts "hello" to all users
3. Stores "world" in editorContentMap (overwrites)
4. Broadcasts "world" to all users

// Final state: All users see "world"
```

### 6. Content Synchronization

**When a new user joins:**

```javascript
// New user joins room
socket.emit('user-joined-room', { username, roomId })

// Server sends current content
socket.emit('sending-updated-content', { 
  content: editorContentMap.get(roomId) 
})

// New user's editor updates to match room state
```

### 7. Best Practices for Users

When collaborating with multiple users:

✅ **DO:**
- Use the chat to coordinate who's editing what
- Watch typing indicators to see who's active
- Make small, incremental changes
- Communicate before major refactors

❌ **DON'T:**
- Edit the same lines simultaneously
- Make large paste operations without warning
- Delete large sections without coordination

### 8. Technical Implementation

**Frontend (EditorPage.jsx):**
```javascript
const handleEditorChange = useCallback((newValue) => {
    // 1. Update local state immediately (optimistic)
    setEditorContent(newValue);
    
    // 2. Broadcast to server
    if (socket && roomId) {
        socket.emit('editor-update', { 
            content: newValue, 
            roomId 
        });
    }
}, [socket, roomId]);

// 3. Listen for updates from others
socket.on('sending-updated-content', (data) => {
    setEditorContent(data.content);
});
```

**Backend (socket.js):**
```javascript
socket.on('editor-update', (data) => {
    // 1. Store latest content
    editorContentMap.set(data.roomId, data.content);
    
    // 2. Broadcast to all OTHER users (not sender)
    socket.broadcast.to(data.roomId).emit(
        'sending-updated-content', 
        { content: data.content }
    );
});
```

### 9. Advanced Scenarios

**Scenario A: User disconnects mid-edit**
```
1. User A is typing
2. Connection drops
3. Server detects disconnect
4. Removes user from room
5. Other users notified
6. Last saved content preserved
```

**Scenario B: Network lag**
```
1. User A types with slow connection
2. Local editor updates immediately
3. Update queued for server
4. When connection improves, update sent
5. Other users receive delayed update
6. Their editors update to latest state
```

**Scenario C: Three users editing**
```
User A types "hello"  → All see "hello"
User B types "world"  → All see "world"
User C types "!"      → All see "!"
User A types "again"  → All see "again"

Final: "again" (last write wins)
```

---

## 🔐 Security Implementation

### Security Layers

```
┌─────────────────────────────────────────┐
│         Client Request                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Layer 1: CORS Validation               │
│  - Check origin                         │
│  - Verify allowed methods               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Layer 2: Rate Limiting                 │
│  - 10 requests per minute               │
│  - Per IP address                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Layer 3: Input Validation              │
│  - Check code length (max 10KB)         │
│  - Validate language                    │
│  - Sanitize inputs                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Layer 4: Execution Timeout             │
│  - Max 30 seconds                       │
│  - Kill long-running processes          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Layer 5: Sandboxed Execution           │
│  - Piston/Judge0 containers             │
│  - Isolated environment                 │
│  - No file system access                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Safe Result                     │
└─────────────────────────────────────────┘
```

### Implementation Details

**1. CORS Protection (`backend/app.js`)**
```javascript
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    credentials: true,
}));
```

**2. Rate Limiting (`backend/app.js`)**
```javascript
const executionLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 10, // 10 requests per minute
    message: {
        success: false,
        error: 'Too many code execution requests. Please try again later.',
    },
});

app.post('/api/execute', executionLimiter, async (req, res) => {
    // ... execution logic
});
```

**3. Input Validation (`backend/app.js`)**
```javascript
// Validation
if (!code || typeof code !== 'string') {
    return res.status(400).json({
        success: false,
        error: 'Code is required and must be a string',
    });
}

// Check code length
const maxLength = parseInt(process.env.MAX_CODE_LENGTH) || 10000;
if (code.length > maxLength) {
    return res.status(400).json({
        success: false,
        error: `Code exceeds maximum length of ${maxLength} characters`,
    });
}
```

**4. Execution Timeout (`backend/codeExecutor.js`)**
```javascript
const response = await axios.post(
    `${apiUrl}/execute`,
    { /* ... */ },
    {
        timeout: 30000, // 30 seconds max
    }
);
```

**5. Sandboxed Execution**
- Piston and Judge0 run code in isolated Docker containers
- No access to host file system
- Limited memory and CPU
- Automatic cleanup after execution

### Security Best Practices

1. **Always use HTTPS in production**
2. **Set strict CORS origins**
3. **Enable rate limiting**
4. **Validate all inputs**
5. **Use environment variables for secrets**
6. **Monitor API usage**
7. **Implement user authentication (future)**
8. **Add code sanitization**
9. **Set resource limits**
10. **Regular security audits**

---

## 🚀 Production Deployment

### Backend Deployment

**Option 1: Heroku**
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set ALLOWED_ORIGINS=https://your-frontend.com
git push heroku main
```

**Option 2: Railway**
```bash
railway login
railway init
railway up
```

**Option 3: DigitalOcean/AWS/Azure**
```bash
# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name code-editor-backend
pm2 save
pm2 startup
```

### Frontend Deployment

**Option 1: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option 2: Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Production Configuration

**Backend `.env` for production:**
```env
PORT=3301
NODE_ENV=production

# Use your production domain
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Stricter limits for production
MAX_CODE_LENGTH=5000
RATE_LIMIT_MAX_REQUESTS=5
EXECUTION_TIMEOUT=30000
```

**Frontend `.env` for production:**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com
```

---

## 🔍 Troubleshooting

### Common Errors & Solutions

#### 1. Ace Editor Path Errors

**Error**: "Unable to infer path to ace from script src"

**Solution**: ✅ **FIXED** - Ace Editor now uses CDN paths
```javascript
ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.32.0/src-noconflict/');
```

**Action**: Restart frontend
```bash
cd frontend
npm run dev
```

---

#### 2. Piston API Timeout

**Error**: "timeout of 10000ms exceeded"

**Solution**: ✅ **FIXED** - Increased timeouts to 30 seconds

**If still timing out**:
- Check internet connection
- Try Judge0 API (often faster)
- Increase timeout in `backend/.env`:
```env
EXECUTION_TIMEOUT=60000  # 60 seconds
```

---

#### 3. Socket Connection Errors

**Error**: "Cannot connect to server"

**Solutions**:
```bash
# Check backend is running
curl http://localhost:3301

# Verify frontend .env
cat frontend/.env
# Should show: VITE_API_URL=http://localhost:3301

# Check CORS in backend/.env
cat backend/.env
# Should include: ALLOWED_ORIGINS=http://localhost:5173
```

---

#### 4. CORS Errors

**Error**: "Access-Control-Allow-Origin"

**Solutions**:
1. Check frontend URL in `backend/.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

2. Add your domain if deploying:
```env
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:5173
```

3. Restart backend

---

#### 5. Rate Limit Exceeded

**Error**: "Too many code execution requests"

**Solutions**:
1. Wait 1 minute (default window)
2. Increase limit in `backend/.env`:
```env
RATE_LIMIT_MAX_REQUESTS=20  # Increased from 10
```
3. Restart backend

---

#### 6. Changes Not Syncing

**Symptoms**: Code changes don't appear for other users

**Solutions**:
1. Check socket connection (browser console):
```javascript
console.log(socket.connected);  // Should be true
```

2. Verify same room ID:
```javascript
console.log(roomId);  // Should match for all users
```

3. Check network tab for socket events
4. Restart both servers

---

### Debugging Tips

**Check Backend Logs**:
```bash
cd backend
npm run dev
# Watch for errors in console
```

**Check Frontend Console**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors (red text)
4. Check Network tab for failed requests

**Test Socket Connection** (browser console):
```javascript
// Check if socket is connected
socket.connected

// Listen to all events
socket.onAny((event, ...args) => {
    console.log(event, args);
});
```

**Test API Directly**:
```bash
# Test health endpoint
curl http://localhost:3301

# Test execution endpoint
curl -X POST http://localhost:3301/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"console.log(\"hello\")","language":"javascript"}'
```

---

## 📞 Support

For issues or questions:
- Check this guide first
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Run `npm test` in backend to verify setup
- Check browser console for errors
- Review backend logs

---

**Last Updated**: December 2024
