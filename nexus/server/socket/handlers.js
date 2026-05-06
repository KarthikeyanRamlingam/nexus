const { authenticateSocket } = require('../middleware/auth')

const rooms = new Map()

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { participants: new Map(), whiteboardHistory: [], messages: [] })
  }
  return rooms.get(roomId)
}

function setupSocketHandlers(io) {
  io.use(authenticateSocket)

  io.on('connection', (socket) => {
    console.log(`✅ Connected: ${socket.user.username} (${socket.id})`)

    socket.on('join-room', ({ roomId }) => {
      if (!roomId) return
      const room = getRoom(roomId)

      const userInfo = {
        socketId: socket.id,
        userId: socket.user.id,
        username: socket.user.username,
        roomId,
        video: true, audio: true, screenSharing: false,
      }

      room.participants.set(socket.id, userInfo)
      socket.join(roomId)
      socket.currentRoom = roomId

      // Send newcomer the list of existing participants
      const existing = [...room.participants.values()].filter(p => p.socketId !== socket.id)
      socket.emit('existing-participants', existing)

      // Tell existing participants about newcomer
      // EXISTING users will initiate the peer connection TO the newcomer
      socket.to(roomId).emit('user-joined', userInfo)

      if (room.whiteboardHistory.length) socket.emit('whiteboard-history', room.whiteboardHistory)
      if (room.messages.length) socket.emit('chat-history', room.messages.slice(-50))

      console.log(`👥 ${socket.user.username} joined ${roomId} (${room.participants.size} total)`)
    })

    // WebRTC signalling — pure relay
    socket.on('offer', ({ targetId, offer }) => {
      console.log(`📡 offer: ${socket.id} → ${targetId}`)
      io.to(targetId).emit('offer', { from: socket.id, fromUser: socket.user, offer })
    })

    socket.on('answer', ({ targetId, answer }) => {
      console.log(`📡 answer: ${socket.id} → ${targetId}`)
      io.to(targetId).emit('answer', { from: socket.id, answer })
    })

    socket.on('ice-candidate', ({ targetId, candidate }) => {
      io.to(targetId).emit('ice-candidate', { from: socket.id, candidate })
    })

    socket.on('media-state', ({ video, audio, screenSharing }) => {
      const roomId = socket.currentRoom
      if (!roomId) return
      const room = rooms.get(roomId)
      if (room?.participants.has(socket.id)) {
        Object.assign(room.participants.get(socket.id), { video, audio, screenSharing })
      }
      socket.to(roomId).emit('participant-media-state', { socketId: socket.id, video, audio, screenSharing })
    })

    socket.on('chat-message', ({ roomId, content, type = 'text', fileName, fileSize }) => {
      if (!roomId || !content) return
      const room = rooms.get(roomId)
      if (!room) return
      const msg = { id: Date.now().toString(), sender: socket.user.username, senderId: socket.user.id, content, type, fileName, fileSize, timestamp: new Date().toISOString() }
      room.messages.push(msg)
      if (room.messages.length > 200) room.messages.shift()
      io.to(roomId).emit('chat-message', msg)
    })

    socket.on('whiteboard-draw', ({ roomId, stroke }) => {
      if (!roomId || !stroke) return
      const room = rooms.get(roomId)
      if (!room) return
      const event = { ...stroke, socketId: socket.id, username: socket.user.username }
      room.whiteboardHistory.push(event)
      if (room.whiteboardHistory.length > 2000) room.whiteboardHistory.shift()
      socket.to(roomId).emit('whiteboard-draw', event)
    })

    socket.on('whiteboard-clear', ({ roomId }) => {
      const room = rooms.get(roomId)
      if (room) room.whiteboardHistory = []
      io.to(roomId).emit('whiteboard-clear')
    })

    socket.on('disconnect', () => {
      const roomId = socket.currentRoom
      if (roomId) {
        const room = rooms.get(roomId)
        if (room) {
          room.participants.delete(socket.id)
          socket.to(roomId).emit('user-left', { socketId: socket.id })
          if (room.participants.size === 0) rooms.delete(roomId)
        }
      }
      console.log(`❌ Disconnected: ${socket.user?.username}`)
    })
  })
}

module.exports = { setupSocketHandlers }
