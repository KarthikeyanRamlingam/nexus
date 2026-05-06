import { useEffect, useRef, useState, useCallback } from 'react'
import { getSocket, initSocket } from '../utils/socket'
import { PeerManager } from '../utils/peerManager'

export function useRoom(roomId, user) {
  const [localStream, setLocalStream]           = useState(null)
  const [remoteStreams, setRemoteStreams]        = useState({})
  const [participants, setParticipants]         = useState([])
  const [messages, setMessages]                 = useState([])
  const [whiteboardEvents, setWhiteboardEvents] = useState([])
  const [mediaState, setMediaState]             = useState({ video: true, audio: true, screenSharing: false })
  const [connected, setConnected]               = useState(false)
  const [error, setError]                       = useState(null)

  const peerManagerRef = useRef(null)
  const localStreamRef = useRef(null)
  const screenStreamRef= useRef(null)
  const setupDoneRef   = useRef(false)

  // Get local media first
  useEffect(() => {
    let active = true
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        localStreamRef.current = stream
        setLocalStream(stream)
      })
      .catch(() => {
        const empty = new MediaStream()
        localStreamRef.current = empty
        setLocalStream(empty)
        setError('Camera/mic denied — joining without video.')
      })
    return () => { active = false }
  }, [])

  // Wait for socket then setup room
  useEffect(() => {
    if (!localStream || !roomId || setupDoneRef.current) return

    let attempts = 0
    const poll = setInterval(async () => {
      attempts++
      let socket = getSocket()
      if (!socket) {
        const token = localStorage.getItem('nexus_token')
        if (token) await initSocket(token)
        socket = getSocket()
      }
      if (!socket) {
        if (attempts > 30) { clearInterval(poll); setError('Cannot connect to server on port 3001.') }
        return
      }
      clearInterval(poll)
      setupDoneRef.current = true

      // ── PeerManager ──
      const addRemote = (id, stream) => {
        console.log('📹 Adding remote stream for', id)
        setRemoteStreams(prev => ({ ...prev, [id]: { stream } }))
      }
      const removeRemote = (id) => {
        setRemoteStreams(prev => { const n = { ...prev }; delete n[id]; return n })
        setParticipants(prev => prev.filter(p => p.socketId !== id))
      }

      peerManagerRef.current = new PeerManager(socket, localStreamRef.current, addRemote, removeRemote)

      socket.on('connect',    () => { setConnected(true);  setError(null) })
      socket.on('disconnect', () =>   setConnected(false))
      setConnected(socket.connected)

      // Newcomer receives existing list → does NOT initiate (existing users will initiate to us)
      socket.on('existing-participants', (list) => {
        console.log('👥 Existing participants:', list.length)
        setParticipants(list)
        // We do NOT call createPeer here — existing users will send us offers
      })

      // Existing user receives this → they initiate to the newcomer
      socket.on('user-joined', (userInfo) => {
        console.log('➕ User joined:', userInfo.username, '— initiating peer')
        setParticipants(prev => [...prev.filter(p => p.socketId !== userInfo.socketId), userInfo])
        // WE are existing → initiate connection TO the newcomer
        peerManagerRef.current.createPeer(userInfo.socketId, true)
      })

      socket.on('user-left', ({ socketId }) => {
        console.log('➖ User left:', socketId)
        removeRemote(socketId)
      })

      // We receive an offer → we are the newcomer, respond with answer
      socket.on('offer', ({ from, fromUser, offer }) => {
        console.log('📨 Received offer from', from)
        setRemoteStreams(prev => ({ ...prev, [from]: { ...(prev[from] || {}), user: fromUser } }))
        peerManagerRef.current.handleOffer(from, offer)
      })

      socket.on('answer',        ({ from, answer })    => peerManagerRef.current.handleAnswer(from, answer))
      socket.on('ice-candidate', ({ from, candidate }) => peerManagerRef.current.handleIceCandidate(from, candidate))

      socket.on('participant-media-state', ({ socketId, ...state }) =>
        setParticipants(prev => prev.map(p => p.socketId === socketId ? { ...p, ...state } : p))
      )

      socket.on('chat-message',       msg     => setMessages(prev => [...prev, msg]))
      socket.on('chat-history',       msgs    => setMessages(msgs))
      socket.on('whiteboard-draw',    event   => setWhiteboardEvents(prev => [...prev, event]))
      socket.on('whiteboard-history', history => setWhiteboardEvents(history))
      socket.on('whiteboard-clear',   ()      => setWhiteboardEvents([]))

      socket.emit('join-room', { roomId })

    }, 300)

    return () => clearInterval(poll)
  }, [localStream, roomId])

  const toggleVideo = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    const s = { ...mediaState, video: track.enabled }
    setMediaState(s)
    getSocket()?.emit('media-state', { ...s, roomId })
  }, [mediaState, roomId])

  const toggleAudio = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    const s = { ...mediaState, audio: track.enabled }
    setMediaState(s)
    getSocket()?.emit('media-state', { ...s, roomId })
  }, [mediaState, roomId])

  const toggleScreenShare = useCallback(async () => {
    if (mediaState.screenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
      const cam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(() => new MediaStream())
      localStreamRef.current = cam; setLocalStream(cam)
      peerManagerRef.current?.replaceTrack(cam)
      const s = { ...mediaState, screenSharing: false }; setMediaState(s)
      getSocket()?.emit('media-state', { ...s, roomId })
    } else {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = screen; localStreamRef.current = screen; setLocalStream(screen)
        peerManagerRef.current?.replaceTrack(screen)
        const s = { ...mediaState, screenSharing: true }; setMediaState(s)
        getSocket()?.emit('media-state', { ...s, roomId })
        screen.getVideoTracks()[0].onended = () => toggleScreenShare()
      } catch {}
    }
  }, [mediaState, roomId])

  const sendMessage         = useCallback((content, type = 'text', meta = {}) => getSocket()?.emit('chat-message',    { roomId, content, type, ...meta }), [roomId])
  const sendWhiteboardEvent = useCallback((stroke) => getSocket()?.emit('whiteboard-draw',  { roomId, stroke }), [roomId])
  const clearWhiteboard     = useCallback(() => { getSocket()?.emit('whiteboard-clear', { roomId }); setWhiteboardEvents([]) }, [roomId])
  const leaveRoom           = useCallback(() => { localStreamRef.current?.getTracks().forEach(t => t.stop()); peerManagerRef.current?.destroyAll() }, [])

  return { localStream, remoteStreams, participants, messages, whiteboardEvents, mediaState, connected, error, toggleVideo, toggleAudio, toggleScreenShare, sendMessage, sendWhiteboardEvent, clearWhiteboard, leaveRoom }
}
