# 🚀 Real-time Code Editor

![Code Editor Banner](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1200&h=400)

A powerful real-time collaborative code editor built with React, Vite, and Socket.IO. Code together, learn together! ✨

## ✨ Features

- 🔄 Real-time code collaboration
- 🔐 User authentication and room management
- 🎨 Syntax highlighting and code autocompletion
- 📱 Responsive design for all devices

## 🛠️ Technologies Used

### Frontend
- ⚛️ React
- ⚡ Vite
- 🎨 Tailwind CSS
- 🔄 React Router
- 🔌 Socket.IO Client
- 📝 Ace Editor
- 🍞 React Hot Toast

### Backend
- 📦 Node.js
- 🚂 Express
- 🔌 Socket.IO
- 🎯 UUID

## 🚀 Getting Started

### Prerequisites

- 📦 Node.js
- 📥 npm or yarn

### Installation

1. Clone the repository:
```sh
git clone https://github.com/yourusername/realtime-code-editor.git
cd realtime-code-editor
```

2. Install backend dependencies:
```sh
cd backend
npm install
```

3. Install frontend dependencies:
```sh
cd frontend
npm install
```

## 🏃‍♂️ Running the Application

1. Start the backend server:
```sh
cd backend
npm run dev
```

2. Start the frontend development server:
```sh
cd frontend
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:5173
```

## 📁 Project Structure

```
realtime-code-editor/
├── backend/
│   ├── app.js
│   ├── package.json
│   ├── server.js
│   └── socket.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Client.jsx
│   │   │   ├── EditorAside.jsx
│   │   │   ├── Form.jsx
│   │   │   └── RealEditor.jsx
│   │   │
│   │   ├── context/
│   │   │   └── SocketContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── EditorPage.jsx
│   │   │   └── Home.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## 📸 Screenshots

![Editor Interface](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200&h=600)
*Real-time collaboration in action*

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

## 📝 License

This project is not licensed yet.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Inspired by collaborative coding platforms
- Built with ❤️ for the developer community