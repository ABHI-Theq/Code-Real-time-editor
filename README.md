# 🚀 Real-time Multi-Language Code Editor

![Code Editor Banner](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1200&h=400)

A powerful real-time collaborative code editor with **secure multi-language execution** built with React, Vite, Socket.IO, and sandboxed execution engines. Code together, execute together, learn together! ✨

---

## 🎯 Key Highlights

✅ **Zero Configuration** - Works immediately with free Piston API  
✅ **15+ Languages** - JavaScript, Python, Java, C++, Go, Rust, and more  
✅ **Real-time Sync** - See changes instantly across all users  
✅ **Smart Conflict Resolution** - Last-write-wins with typing indicators  
✅ **Secure Execution** - Sandboxed environment with rate limiting  
✅ **Mobile Responsive** - Works on desktop, tablet, and mobile  
✅ **Group Chat** - Built-in messaging for team collaboration  

---

## ✨ Features

### Core Functionality
- 🔄 **Real-time code collaboration** - See changes instantly across all users
- 💻 **15+ Programming Languages** - JavaScript, Python, Java, C++, C, C#, PHP, Ruby, Go, Rust, TypeScript, and more
- 🔒 **Secure Code Execution** - Sandboxed environment with rate limiting and input validation
- 🎨 **Syntax Highlighting** - Language-specific syntax highlighting and autocompletion
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ▶️ **Live Code Execution** - Run code and see output in real-time
- 🗨️ **Group Chat** - Communicate with your team while coding
- 👥 **User Presence** - See who's online and typing indicators
- 🎯 **Room Management** - Create/join rooms with unique IDs
- 🔐 **Security First** - CORS protection, rate limiting, input validation

---

## 🛠️ Technologies Used

### Frontend
- ⚛️ React 18
- ⚡ Vite
- 🎨 Tailwind CSS
- 🔄 React Router
- 🔌 Socket.IO Client
- 📝 Ace Editor (multi-language support)
- 🍞 React Hot Toast
- 🌐 Axios

### Backend
- 📦 Node.js
- 🚂 Express
- 🔌 Socket.IO
- 🎯 UUID
- 🔒 Express Rate Limit
- 🐍 Piston API (code execution)
- ⚖️ Judge0 API (optional premium execution)

### Security
- 🛡️ CORS Protection
- ⏱️ Rate Limiting (10 req/min)
- 📏 Input Validation
- 🔐 Sandboxed Execution
- ⏰ Timeout Protection

---

## 🚀 Getting Started

### Prerequisites

- 📦 Node.js (v16 or higher)
- 📥 npm or yarn
- 🌐 Internet connection (for Piston API)

### Quick Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/realtime-code-editor.git
cd realtime-code-editor
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
```

4. **Configuration (optional):**
Backend is pre-configured to use free Piston API. No setup needed!

---

## 🏃‍♂️ Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Open your browser:**
```
http://localhost:5173
```

### Test Code Execution (Optional)

```bash
cd backend
npm test
```

---

## 🎯 How to Use

1. **Create/Join Room**: Enter a username and create a new room or join existing one
2. **Select Language**: Choose from 15+ programming languages in the dropdown
3. **Write Code**: Start coding with syntax highlighting and autocompletion
4. **Run Code**: Click "Run Code" button to execute and see output
5. **Collaborate**: Share room ID with teammates for real-time collaboration
6. **Chat**: Use group chat to communicate while coding

---

## 🔒 Setup & Configuration

### ⚡ Quick Start (No Configuration Needed!)

The app works **out of the box** with **Piston API** (free, no API key required).

### 🔑 Optional: Judge0 API Setup

For premium features (execution time tracking, better limits):

1. **Get API key**: [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce) (Free tier: 50 req/day)
2. **Add to backend/.env**:
   ```env
   JUDGE0_API_KEY=your_actual_api_key_here
   ```
3. **Restart backend**: `npm run dev`

**Detailed guide**: See [TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md#judge0-api-setup)

---

## 💻 Supported Languages

| Language   | Execution | Syntax Highlighting |
|------------|-----------|---------------------|
| JavaScript | ✅        | ✅                  |
| Python     | ✅        | ✅                  |
| Java       | ✅        | ✅                  |
| C++        | ✅        | ✅                  |
| C          | ✅        | ✅                  |
| C#         | ✅        | ✅                  |
| PHP        | ✅        | ✅                  |
| Ruby       | ✅        | ✅                  |
| Go         | ✅        | ✅                  |
| Rust       | ✅        | ✅                  |
| TypeScript | ✅        | ✅                  |
| Kotlin     | ✅        | ✅                  |
| Swift      | ✅        | ✅                  |
| R          | ✅        | ✅                  |
| Bash       | ✅        | ✅                  |
| SQL        | ✅        | ✅                  |

---

## 📁 Project Structure

```
realtime-code-editor/
├── backend/
│   ├── app.js                 # Express app with security middleware
│   ├── codeExecutor.js        # Multi-language execution engine
│   ├── socket.js              # Socket.IO real-time logic
│   ├── server.js              # Server entry point
│   ├── test-execution.js      # Test script
│   ├── .env                   # Environment configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API clients
│   │   ├── context/           # React context
│   │   └── App.jsx            # Main app
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── README.md                  # This file
├── ARCHITECTURE.md            # System architecture & diagrams
└── TECHNICAL_GUIDE.md         # Code execution, multi-user logic, security
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[README.md](./README.md)** | Project overview and quick start (this file) |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System architecture, data flow, and diagrams |
| **[TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md)** | Code execution, multi-user logic, security, troubleshooting |

---

## ❓ FAQ

### Do I need to configure anything for code execution?
**No!** The app uses Piston API by default, which is completely free and requires no setup. Judge0 is optional for premium features.

### How does multi-user editing work?
The system uses **Last Write Wins** strategy. When multiple users edit simultaneously, the most recent change takes precedence. See [TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md#multi-user-editing-logic) for detailed explanation.

### What happens if two users type at the same time?
Each user sees their own changes immediately (optimistic updates). The server processes edits in the order received and broadcasts the final state to all users. Typing indicators help coordinate editing.

### Is my code secure?
Yes! Code executes in sandboxed environments (Piston/Judge0). The backend has rate limiting, input validation, and timeout protection. Never execute untrusted code locally.

### Can I use this for production?
Yes! See [TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md#production-deployment) for deployment guides. Remember to:
- Set `NODE_ENV=production`
- Configure CORS with your domain
- Use HTTPS
- Set stricter rate limits

### Which languages are supported?
15+ languages including JavaScript, Python, Java, C++, C, C#, PHP, Ruby, Go, Rust, TypeScript, Bash, SQL, and more. All support both syntax highlighting and execution.

### How do I test code execution?
Run `npm test` in the backend directory to test JavaScript, Python, and error handling.

---

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to server"**
- Check backend is running: `cd backend && npm run dev`
- Verify `VITE_API_URL=http://localhost:3301` in `frontend/.env`

**"Timeout errors"**
- Timeouts are set to 30 seconds
- Check internet connection
- Consider using Judge0 API (often faster)

**"CORS errors"**
- Add your frontend URL to `ALLOWED_ORIGINS` in `backend/.env`
- Restart backend after changes

**For detailed troubleshooting**: See [TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md#troubleshooting)

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

---

## 📝 License

This project is not licensed yet.

---

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Powered by [Piston API](https://github.com/engineer-man/piston) for free code execution
- Optional [Judge0 API](https://judge0.com/) integration for premium features
- Inspired by collaborative coding platforms like CodePen and Replit
- Built with ❤️ for the developer community

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Status**: Production Ready ✅
