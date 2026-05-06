# Nexus — Real-Time Collaboration Platform

A full-stack video conferencing and collaboration app featuring multi-user video/audio, screen sharing, a collaborative whiteboard, file sharing, live chat, JWT authentication, and end-to-end encrypted media.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router |
| Real-time media | WebRTC (via simple-peer) |
| Signalling | Socket.io |
| Backend API | Node.js, Express |
| Auth | JWT + bcrypt |
| Database | MongoDB (Mongoose) |
| Containerisation | Docker + Docker Compose |

---

## Project Structure

```
nexus/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx       # Login / register / guest
│   │   │   ├── LobbyPage.jsx      # Create / join rooms
│   │   │   └── RoomPage.jsx       # Main meeting room
│   │   ├── components/
│   │   │   ├── VideoTile.jsx      # Single video feed
│   │   │   ├── VideoGrid.jsx      # Adaptive video layout
│   │   │   ├── ChatPanel.jsx      # Sidebar chat + file share
│   │   │   ├── Whiteboard.jsx     # Canvas drawing board
│   │   │   ├── ControlBar.jsx     # Media controls
│   │   │   └── ParticipantsSidebar.jsx
│   │   ├── hooks/
│   │   │   └── useRoom.js         # WebRTC + socket orchestration
│   │   ├── utils/
│   │   │   ├── api.js             # Axios instance
│   │   │   ├── socket.js          # Socket.io singleton
│   │   │   └── peerManager.js     # WebRTC peer lifecycle
│   │   └── context/
│   │       └── AuthContext.jsx
│   └── Dockerfile
│
└── server/                  # Node.js backend
    ├── index.js              # Express + Socket.io entry
    ├── routes/
    │   ├── auth.js           # /api/auth/*
    │   └── rooms.js          # /api/rooms/*
    ├── middleware/
    │   └── auth.js           # JWT verify + socket auth
    ├── models/
    │   ├── User.js
    │   └── Room.js
    ├── socket/
    │   └── handlers.js       # All socket event handlers
    └── Dockerfile
```

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js 18+
- MongoDB running locally **or** use Docker Compose

### 1. Install dependencies

```bash
# In the nexus/ root
npm install

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env — set MONGO_URI and JWT_SECRET
```

### 3. Run

```bash
# From nexus/ root (runs both server and client with hot reload)
npm run dev

# OR separately:
cd server && npm run dev     # → http://localhost:3001
cd client && npm run dev     # → http://localhost:5173
```

---

## Docker (Production)

```bash
# Build and start all services
docker compose up --build

# Client:  http://localhost:5173
# Server:  http://localhost:3001
# MongoDB: localhost:27017
```

---

## API Endpoints

### Auth
| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | `{username, email, password}` | Register |
| POST | `/api/auth/login` | `{email, password}` | Login → JWT |
| POST | `/api/auth/guest` | `{username}` | Guest session |

### Rooms *(requires `Authorization: Bearer <token>`)*
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/rooms/create` | Create a room |
| GET | `/api/rooms` | List public rooms |
| GET | `/api/rooms/:roomId` | Get room info |

---

## Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{roomId}` | Enter a room |
| `offer` | `{targetId, offer}` | WebRTC offer |
| `answer` | `{targetId, answer}` | WebRTC answer |
| `ice-candidate` | `{targetId, candidate}` | ICE candidate |
| `media-state` | `{video, audio, screenSharing}` | Broadcast media state |
| `chat-message` | `{roomId, content, type}` | Send message |
| `whiteboard-draw` | `{roomId, stroke}` | Draw stroke |
| `whiteboard-clear` | `{roomId}` | Clear board |

### Server → Client
| Event | Description |
|-------|-------------|
| `existing-participants` | List of users already in room |
| `user-joined` | New participant info |
| `user-left` | `{socketId}` |
| `offer / answer / ice-candidate` | WebRTC signalling relay |
| `chat-message` | New message |
| `chat-history` | Last 50 messages on join |
| `whiteboard-draw` | Remote stroke |
| `whiteboard-history` | Full board state on join |
| `whiteboard-clear` | Board cleared |

---

## Security

- **Media**: WebRTC uses DTLS-SRTP automatically — all audio/video is encrypted in transit
- **Auth**: Passwords hashed with bcrypt (12 rounds); JWT tokens expire in 24h
- **Transport**: All API and socket traffic should run over HTTPS/WSS in production
- **Rate limiting**: 100 requests per 15 minutes per IP on all `/api/` routes
- **Helmet**: HTTP security headers applied to all responses
- **File sharing**: Files shared via chat are base64-encoded DataChannel transfers — never stored server-side

---

## Adding a TURN Server (Production Must-Have)

About 15-20% of WebRTC connections fail without TURN. Edit `client/src/utils/peerManager.js`:

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

Free/cheap options: **Metered.ca**, **Twilio NTS**, or self-host **coturn**.

---

## Environment Variables

### Server (`server/.env`)
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/nexus
JWT_SECRET=your-secret-here
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)
```
VITE_SERVER_URL=http://localhost:3001
```

---

## Features Implemented

- [x] Multi-user video/audio calling (WebRTC mesh via simple-peer)
- [x] Screen sharing with automatic track replacement
- [x] Collaborative whiteboard (pen, eraser, shapes, colours, download)
- [x] Real-time chat with file sharing
- [x] Participant list with live media state indicators
- [x] JWT auth (register, login, guest mode)
- [x] Socket.io signalling server with room management
- [x] Rate limiting + Helmet security headers
- [x] Docker + Nginx production build
- [x] Adaptive video grid layout (1–8+ participants)
- [x] Whiteboard history sync for late joiners
- [x] Chat history for late joiners

## Roadmap / Extensions

- [ ] TURN server integration
- [ ] Recording (MediaRecorder API)
- [ ] Reactions / emoji overlay
- [ ] Breakout rooms
- [ ] Server-side SFU (mediasoup) for 10+ participants
- [ ] S3 file storage for large files
- [ ] Room passwords
