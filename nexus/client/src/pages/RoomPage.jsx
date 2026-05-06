import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRoom } from '../hooks/useRoom'
import VideoGrid from '../components/VideoGrid'
import ChatPanel from '../components/ChatPanel'
import Whiteboard from '../components/Whiteboard'
import ControlBar from '../components/ControlBar'
import ParticipantsSidebar from '../components/ParticipantsSidebar'

export default function RoomPage() {
  const { roomId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [chatOpen, setChatOpen]             = useState(false)
  const [whiteboardOpen, setWhiteboardOpen] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [unreadCount, setUnreadCount]       = useState(0)
  const [prevMsgLen, setPrevMsgLen]         = useState(0)

  const {
    localStream, remoteStreams, participants, messages,
    whiteboardEvents, mediaState, connected, error,
    toggleVideo, toggleAudio, toggleScreenShare,
    sendMessage, sendWhiteboardEvent, clearWhiteboard, leaveRoom,
  } = useRoom(roomId, user)

  useEffect(() => {
    if (!chatOpen && messages.length > prevMsgLen) {
      setUnreadCount(c => c + (messages.length - prevMsgLen))
    }
    setPrevMsgLen(messages.length)
  }, [messages.length])

  useEffect(() => { if (chatOpen) setUnreadCount(0) }, [chatOpen])

  const handleLeave = () => {
    leaveRoom()
    navigate('/')
  }

  const participantCount = 1 + Object.keys(remoteStreams).length

  return (
    <div style={S.root}>
      {/* Top bar */}
      <div style={S.topBar}>
        <div style={S.logo}>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#4f8cff" fillOpacity="0.15"/>
            <path d="M8 16 L16 8 L24 16 L16 24 Z" stroke="#4f8cff" strokeWidth="1.5" fill="none"/>
            <circle cx="16" cy="16" r="3" fill="#4f8cff"/>
          </svg>
          <span style={S.logoText}>NEXUS</span>
        </div>
        <div style={S.topCenter}>
          <span style={S.roomTitle}>Room #{roomId}</span>
          <div style={{ ...S.statusDot, background: connected ? 'var(--green)' : '#f5a623' }} />
          <span style={{ ...S.statusText, color: connected ? 'var(--text-secondary)' : '#f5a623' }}>
            {connected ? 'Connected' : 'Connecting…'}
          </span>
        </div>
        <div style={S.topRight}>
          <button style={{ ...S.topBtn, ...(showParticipants ? S.topBtnActive : {}) }}
            onClick={() => setShowParticipants(v => !v)}>
            👥 {participantCount}
          </button>
        </div>
      </div>

      {/* Error banner — only show if not connected after a moment */}
      {error && (
        <div style={S.errorBanner}>
          <strong>⚠ {error}</strong>
          {error.includes('3001') && (
            <span style={{ marginLeft: 12, opacity: 0.8 }}>
              → Open a terminal, go to <code style={S.code}>nexus/server</code> and run <code style={S.code}>npm run dev</code>
            </span>
          )}
        </div>
      )}

      {/* Body */}
      <div style={S.body}>
        <div style={S.videoArea}>
          {whiteboardOpen && (
            <Whiteboard
              events={whiteboardEvents}
              onDraw={sendWhiteboardEvent}
              onClear={clearWhiteboard}
              onClose={() => setWhiteboardOpen(false)}
            />
          )}
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            localUser={user}
            participants={participants}
            localMediaState={mediaState}
          />
        </div>
        {showParticipants && (
          <ParticipantsSidebar
            participants={participants}
            localUser={user}
            localMediaState={mediaState}
          />
        )}
        {chatOpen && (
          <ChatPanel
            messages={messages}
            onSend={sendMessage}
            currentUser={user}
            onClose={() => setChatOpen(false)}
          />
        )}
      </div>

      <ControlBar
        roomId={roomId}
        mediaState={mediaState}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onToggleScreen={toggleScreenShare}
        onToggleChat={() => setChatOpen(v => !v)}
        onToggleWhiteboard={() => setWhiteboardOpen(v => !v)}
        onLeave={handleLeave}
        participantCount={participantCount}
        chatOpen={chatOpen}
        whiteboardOpen={whiteboardOpen}
        unreadCount={unreadCount}
      />
    </div>
  )
}

const S = {
  root: { height:'100vh', display:'flex', flexDirection:'column', background:'var(--bg-void)', overflow:'hidden' },
  topBar: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', height:48, background:'var(--bg-surface)', borderBottom:'1px solid var(--border)', flexShrink:0, zIndex:10 },
  logo: { display:'flex', alignItems:'center', gap:7 },
  logoText: { fontWeight:800, fontSize:13, letterSpacing:'0.12em' },
  topCenter: { display:'flex', alignItems:'center', gap:8 },
  roomTitle: { fontWeight:700, fontSize:13, fontFamily:'var(--font-mono)', letterSpacing:'0.05em' },
  statusDot: { width:7, height:7, borderRadius:'50%', transition:'background 0.3s' },
  statusText: { fontSize:11, transition:'color 0.3s' },
  topRight: { display:'flex', gap:6 },
  topBtn: { padding:'4px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-elevated)', color:'var(--text-secondary)', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'var(--font-display)', transition:'all 0.15s' },
  topBtnActive: { background:'var(--accent-glow)', color:'var(--accent)', borderColor:'rgba(79,140,255,0.4)' },
  errorBanner: { background:'rgba(255,79,106,0.1)', borderBottom:'1px solid rgba(255,79,106,0.25)', color:'var(--red)', fontSize:12, padding:'10px 16px', flexShrink:0, display:'flex', alignItems:'center' },
  code: { fontFamily:'var(--font-mono)', background:'rgba(255,255,255,0.08)', padding:'1px 6px', borderRadius:4 },
  body: { flex:1, display:'flex', overflow:'hidden', position:'relative' },
  videoArea: { flex:1, display:'flex', position:'relative', overflow:'hidden' },
}
