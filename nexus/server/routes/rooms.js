const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory rooms fallback
const memRooms = new Map();

// POST /api/rooms/create
router.post('/create', (req, res) => {
  try {
    const { name, isPrivate } = req.body;
    if (!name) return res.status(400).json({ error: 'Room name required' });

    const roomId = uuidv4().slice(0, 8).toUpperCase();
    const room = {
      roomId,
      name,
      host: req.user.id,
      isPrivate: !!isPrivate,
      participants: [],
      createdAt: new Date().toISOString(),
    };
    memRooms.set(roomId, room);
    res.status(201).json({ room });
  } catch (err) {
    res.status(500).json({ error: 'Could not create room' });
  }
});

// GET /api/rooms/:roomId
router.get('/:roomId', (req, res) => {
  const room = memRooms.get(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ room });
});

// GET /api/rooms — list public rooms
router.get('/', (req, res) => {
  const rooms = [...memRooms.values()]
    .filter(r => !r.isPrivate)
    .map(({ name, roomId, host, participants, createdAt }) => ({
      name, roomId, host, participantCount: participants.length, createdAt,
    }));
  res.json({ rooms });
});

module.exports = router;
module.exports.memRooms = memRooms;
