require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const { authenticateToken } = require('./middleware/auth');
const { setupSocketHandlers } = require('./socket/handlers');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  },
  transports: ['polling', 'websocket'],
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/rooms', authenticateToken, roomRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

setupSocketHandlers(io);

// Try MongoDB, silently fall back
try {
  const mongoose = require('mongoose');
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/nexus';
  mongoose.connect(uri)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(() => console.log('⚠️  Running without MongoDB (in-memory mode)'));
} catch(e) {}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Nexus server running on port ${PORT}`));
