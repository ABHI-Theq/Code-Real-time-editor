# Real-time Code Editor

This project is a real-time collaborative code editor built with React, Vite, and Socket.IO. It allows multiple users to join a room and edit code together in real-time.

## Features

- Real-time code collaboration
- User authentication and room management
- Syntax highlighting and code autocompletion
- Responsive design

## Technologies Used

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Socket.IO Client
- Ace Editor
- React Hot Toast

### Backend

- Node.js
- Express
- Socket.IO
- UUID

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository:

```sh
git clone https://github.com/yourusername/realtime-code-editor.git
cd realtime-code-editor
```

2. Install dependencies for the backend

```sh
cd backend
npm install
```

3. Install dependencies for the frontend

```sh
cd frontend
npm install
```

Running the Application


1.Start the backend development server

```sh
cd backend
npm run dev
```

1.Start the backend development server

```sh
cd frontend
npm run dev
```

3.Open your browser navigate to 

```sh
http://localhost:5173.
```

Project Structure

-------------------
.gitignore
backend/
    app.js
    package.json
    server.js
    socket.js
frontend/
    .env
    .gitignore
    eslint.config.js
    index.html
    package.json
    postcss.config.js
    public/
    README.md
    src/
        App.css
        App.jsx
        assets/
        components/
            Client.jsx
            EditorAside.jsx
            Form.jsx
            RealEditor.jsx
        context/
            SocketContext.jsx
        index.css
        main.jsx
        pages/
            EditorPage.jsx
            Home.jsx
    tailwind.config.js
    vite.config.js

-------------------