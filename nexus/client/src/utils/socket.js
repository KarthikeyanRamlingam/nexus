let _io = null
let socket = null

async function loadIO() {
  if (_io) return _io
  const mod = await import('socket.io-client')
  _io = mod.io
  return _io
}

export const getSocket = () => socket

export const initSocket = async (token) => {
  if (socket?.connected) return socket
  if (socket) { socket.disconnect(); socket = null }

  const io = await loadIO()
  socket = io('http://localhost:3001', {
    auth: { token },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
    timeout: 10000,
  })

  socket.on('connect', () => console.log('✅ Socket connected:', socket.id))
  socket.on('connect_error', (e) => console.error('❌ Socket error:', e.message))
  return socket
}

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null }
}
