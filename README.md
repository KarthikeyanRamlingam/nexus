# 🔷 Nexus — Real-Time Collaboration Platform

> A full-stack video conferencing and collaboration app built with WebRTC, Socket.io, React, and Node.js.

![Node](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat&logo=socket.io)
![WebRTC](https://img.shields.io/badge/WebRTC-Enabled-333333?style=flat&logo=webrtc)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📹 **Multi-user Video Calls** | Peer-to-peer HD video and audio via WebRTC mesh |
| 🖥 **Screen Sharing** | Share your screen with one click, auto-restores camera on stop |
| ✏️ **Collaborative Whiteboard** | Real-time canvas with pen, eraser, shapes, colours, and download |
| 💬 **Live Chat** | In-room messaging with file sharing support |
| 📎 **File Sharing** | Send files directly through the chat panel |
| 👥 **Participant List** | See who's in the room with live mic/camera status indicators |
| 🔐 **JWT Authentication** | Register, login, or join instantly as a guest |
| 🔒 **Encrypted Media** | WebRTC uses DTLS-SRTP — all audio/video is encrypted in transit |
| 🏠 **Room Management** | Create named rooms, join by code, list active public rooms |

---

## 🛠 Tech Stack

```
Frontend          Backend           Real-time         Security
─────────         ────────          ─────────         ────────
React 18          Node.js           WebRTC            JWT (24h expiry)
Vite              Express           Socket.io 4       bcrypt (12 rounds)
React Router 6    MongoDB           simple-peer       Helmet
Lucide Icons      Mongoose          STUN/TURN         Rate Limiting
```

---

## 📁 Project Structure

```
nexus/
├── client/                        # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx       # Login / Register / Guest
│   │   │   ├── LobbyPage.jsx      # Create & join rooms
│   │   │   └── RoomPage.jsx       # Main meeting room
│   │   ├── components/
│   │   │   ├── VideoTile.jsx      # Single video feed tile
│   │   │   ├── VideoGrid.jsx      # Adaptive grid layout
│   │   │   ├── ChatPanel.jsx      # Sidebar chat + file share
│   │   │   ├── Whiteboard.jsx     # Collaborative canvas
│   │   │   ├── ControlBar.jsx     # Mic / camera / controls
│   │   │   └── ParticipantsSidebar.jsx
│   │   ├── hooks/
│   │   │   └── useRoom.js         # WebRTC + socket orchestration
│   │   ├── utils/
│   │   │   ├── peerManager.js     # WebRTC peer lifecycle
│   │   │   ├── socket.js          # Socket.io singleton
│   │   │   └── api.js             # Axios instance
│   │   └── context/
│   │       └── AuthContext.jsx    # Auth state + token management
│   └── vite.config.js
│
└── server/                        # Node.js backend
    ├── index.js                   # Express + Socket.io entry point
    ├── routes/
    │   ├── auth.js                # POST /api/auth/*
    │   └── rooms.js               # GET/POST /api/rooms/*
    ├── middleware/
    │   └── auth.js                # JWT verify (REST + Socket)
    ├── models/
    │   ├── User.js                # Mongoose user schema
    │   └── Room.js                # Mongoose room schema
    └── socket/
        └── handlers.js            # All Socket.io event handlers
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **MongoDB** (optional) — app runs in-memory without it

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nexus.git
cd nexus
```

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/nexus
JWT_SECRET=your-random-secret-key-here
CLIENT_URL=http://localhost:5173
```

### 3. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 4. Run

Open **two terminals**:

```bash
# Terminal 1 — Server
cd nexus/server
npm run dev
# → Running on http://localhost:3001

# Terminal 2 — Client
cd nexus/client
npm run dev
# → Running on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🐳 Docker (Production)

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| MongoDB | localhost:27017 |

---

## 📡 API Reference

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ username, email, password }` | Create account |
| POST | `/api/auth/login` | `{ email, password }` | Login → JWT |
| POST | `/api/auth/guest` | `{ username }` | Guest session |

### Rooms *(Bearer token required)*

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/rooms/create` | Create a new room |
| GET | `/api/rooms` | List public rooms |
| GET | `/api/rooms/:roomId` | Get room details |

---

## 🔌 Socket.io Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join-room` | `{ roomId }` | Enter a room |
| `offer` | `{ targetId, offer }` | WebRTC offer (SDP) |
| `answer` | `{ targetId, answer }` | WebRTC answer (SDP) |
| `ice-candidate` | `{ targetId, candidate }` | ICE candidate relay |
| `media-state` | `{ video, audio, screenSharing }` | Broadcast media toggle |
| `chat-message` | `{ roomId, content, type }` | Send chat message |
| `whiteboard-draw` | `{ roomId, stroke }` | Broadcast draw stroke |
| `whiteboard-clear` | `{ roomId }` | Clear the whiteboard |

### Server → Client

| Event | Description |
|---|---|
| `existing-participants` | List of users already in room (on join) |
| `user-joined` | A new participant joined |
| `user-left` | A participant disconnected |
| `offer / answer / ice-candidate` | WebRTC signalling relay |
| `chat-message` | New chat message |
| `chat-history` | Last 50 messages (on join) |
| `whiteboard-draw` | Remote draw event |
| `whiteboard-history` | Full board state (on join) |
| `whiteboard-clear` | Board was cleared |

---

## 🔒 Security

- **Media** — WebRTC DTLS-SRTP encrypts all audio/video automatically
- **Auth** — Passwords hashed with bcrypt (12 rounds); JWT tokens expire in 24h
- **Transport** — Use HTTPS + WSS in production (required for camera access on non-localhost)
- **Rate limiting** — 100 requests per 15 minutes per IP on all `/api/` routes
- **Headers** — Helmet.js applies security headers on all responses

---

## 🌐 Production Deployment Notes

### TURN Server (Important)

Without a TURN server, ~15–20% of WebRTC connections fail (users behind strict NATs/firewalls). Add one in `client/src/utils/peerManager.js`:

```js
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'your-username',
      credential: 'your-password',
    },
  ],
}
```

Free options: **[Metered.ca](https://www.metered.ca/tools/openrelay/)**, **Twilio NTS**, or self-host **coturn**.

### Environment Variables (Production)

```env
JWT_SECRET=long-random-cryptographic-string
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/nexus
CLIENT_URL=https://your-domain.com
```

---

## 🗺 Roadmap

- [ ] TURN server integration
- [ ] Session recording (MediaRecorder API)
- [ ] Emoji reactions overlay
- [ ] Breakout rooms
- [ ] Server-side SFU (mediasoup) for 10+ participants
- [ ] Room passwords
- [ ] Push-to-talk mode
- [ ] Mobile responsive layout

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'Add your feature'`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT © 2026 — feel free to use, modify, and distribute.

---

<div align="center">
  Built with WebRTC · Socket.io · React · Node.js
</div>
