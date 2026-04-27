# 🚀 Real-time Multi-Language Code Editor - 1 Minute Overview

## What is it?
A **collaborative code editor** that lets multiple developers code together in real-time, like Google Docs but for programming. Built with React, Node.js, and Socket.IO.

## Key Features (30 seconds)
- **Real-time collaboration** - See teammates typing and changes instantly
- **15+ programming languages** - JavaScript, Python, Java, C++, Go, Rust, and more
- **Live code execution** - Run code directly in the browser with secure sandboxing
- **Group chat** - Communicate while coding
- **Zero setup** - Works immediately with free Piston API
- **Mobile responsive** - Code on any device

## How it Works (20 seconds)
1. **Create/Join Room** - Enter username and room ID
2. **Select Language** - Choose from dropdown (JavaScript, Python, etc.)
3. **Code Together** - Multiple users edit simultaneously with conflict resolution
4. **Run & Share** - Execute code and see results in real-time
5. **Chat** - Built-in messaging for team coordination

## Technical Stack (10 seconds)
- **Frontend**: React 18 + Vite + Tailwind CSS + Socket.IO Client
- **Backend**: Node.js + Express + Socket.IO + Rate Limiting
- **Code Execution**: Piston API (free) + Judge0 API (optional)
- **Security**: CORS protection, input validation, sandboxed execution

## Perfect For
- **Pair programming** sessions
- **Code interviews** and technical assessments  
- **Teaching** programming concepts
- **Team collaboration** on small scripts
- **Code sharing** and live demonstrations

## Quick Start
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend  
cd frontend && npm install && npm run dev

# Open http://localhost:5173
```

**Status**: Production ready ✅ | **Setup time**: < 2 minutes | **No API keys required**