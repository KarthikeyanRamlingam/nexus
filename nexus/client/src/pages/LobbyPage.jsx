import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function LobbyPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('create')   // create | join
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [publicRooms, setPublicRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get('/api/rooms')
      setPublicRooms(data.rooms || [])
    } catch { /* server might not be up */ }
  }

  const createRoom = async (e) => {
    e.preventDefault()
    if (!roomName.trim()) return
    setLoading(true); setError('')
    try {
      const { data } = await axios.post('/api/rooms/create', { name: roomName.trim() })
      navigate(`/room/${data.room.roomId}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create room')
    } finally { setLoading(false) }
  }

  const joinRoom = (e) => {
    e.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (!code) return
    navigate(`/room/${code}`)
  }

  const avatar = user?.username?.[0]?.toUpperCase() || '?'

  return (
    <div style={S.root}>
      <div style={S.grid} />
      <div style={S.glow} />

      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#4f8cff" fillOpacity="0.15"/>
            <path d="M8 16 L16 8 L24 16 L16 24 Z" stroke="#4f8cff" strokeWidth="1.5" fill="none"/>
            <circle cx="16" cy="16" r="3" fill="#4f8cff"/>
          </svg>
          <span style={S.logoText}>NEXUS</span>
        </div>
        <div style={S.userRow}>
          <div style={S.avatarChip}>
            <div style={S.avatar}>{avatar}</div>
            <span style={S.username}>{user?.username}</span>
            {user?.isGuest && <span className="tag tag-amber">GUEST</span>}
          </div>
          <button className="btn btn-ghost" onClick={logout} style={{padding:'7px 14px',fontSize:12}}>Sign out</button>
        </div>
      </header>

      {/* Main */}
      <main style={S.main}>
        <div style={S.hero} className="fade-up">
          <h1 style={S.heroTitle}>Start collaborating<br/><span style={S.heroAccent}>in seconds</span></h1>
          <p style={S.heroSub}>Video · Screen Share · Whiteboard · File Sharing · Chat</p>
        </div>

        <div style={S.panel} className="fade-up">
          {/* Tabs */}
          <div style={S.tabs}>
            <button style={{...S.tab,...(tab==='create'?S.tabActive:{})}} onClick={()=>setTab('create')}>
              Create Room
            </button>
            <button style={{...S.tab,...(tab==='join'?S.tabActive:{})}} onClick={()=>setTab('join')}>
              Join by Code
            </button>
          </div>

          {tab === 'create' ? (
            <form onSubmit={createRoom} style={S.form}>
              <div style={S.field}>
                <label style={S.label}>Room Name</label>
                <input className="input" placeholder="Team standup, Design review…"
                  value={roomName} onChange={e => setRoomName(e.target.value)} required />
              </div>
              {error && <p style={S.error}>{error}</p>}
              <button className="btn btn-primary" type="submit" disabled={loading} style={{height:44}}>
                {loading ? <span className="spinner" style={{width:18,height:18}}/> : '+ Create Room'}
              </button>
            </form>
          ) : (
            <form onSubmit={joinRoom} style={S.form}>
              <div style={S.field}>
                <label style={S.label}>Room Code</label>
                <input className="input" placeholder="e.g. AB3F9C12" style={{fontFamily:'var(--font-mono)',letterSpacing:'0.1em'}}
                  value={joinCode} onChange={e => setJoinCode(e.target.value)} required />
              </div>
              <button className="btn btn-primary" type="submit" style={{height:44}}>
                Join Room →
              </button>
            </form>
          )}
        </div>

        {/* Public rooms */}
        {publicRooms.length > 0 && (
          <div style={S.publicSection} className="fade-up">
            <h3 style={S.sectionTitle}>Active Rooms</h3>
            <div style={S.roomGrid}>
              {publicRooms.map(room => (
                <div key={room.roomId} style={S.roomCard}
                  onClick={() => navigate(`/room/${room.roomId}`)}>
                  <div style={S.roomName}>{room.name}</div>
                  <div style={S.roomMeta}>
                    <span className="tag tag-green">{room.participantCount} online</span>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-muted)'}}>{room.roomId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature pills */}
        <div style={S.features}>
          {['🔒 E2E Encrypted','📹 HD Video','🖥 Screen Share','✏️ Whiteboard','📎 File Share','💬 Live Chat'].map(f => (
            <span key={f} style={S.featurePill}>{f}</span>
          ))}
        </div>
      </main>
    </div>
  )
}

const S = {
  root: { minHeight:'100vh', background:'var(--bg-void)', position:'relative', overflow:'hidden' },
  grid: { position:'absolute', inset:0, backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize:'48px 48px', opacity:0.3 },
  glow: { position:'absolute', top:'20%', left:'50%', transform:'translate(-50%,-50%)', width:800, height:800, background:'radial-gradient(circle, rgba(79,140,255,0.06) 0%, transparent 70%)', pointerEvents:'none' },
  header: { position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid var(--border)', backdropFilter:'blur(8px)', background:'rgba(6,8,16,0.6)' },
  logo: { display:'flex', alignItems:'center', gap:8 },
  logoText: { fontWeight:800, fontSize:16, letterSpacing:'0.12em' },
  userRow: { display:'flex', alignItems:'center', gap:12 },
  avatarChip: { display:'flex', alignItems:'center', gap:8, background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'6px 12px' },
  avatar: { width:24, height:24, borderRadius:'50%', background:'var(--accent-dim)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 },
  username: { fontSize:13, fontWeight:600 },
  main: { position:'relative', zIndex:1, maxWidth:520, margin:'0 auto', padding:'60px 24px 40px', display:'flex', flexDirection:'column', alignItems:'center', gap:32 },
  hero: { textAlign:'center' },
  heroTitle: { fontSize:40, fontWeight:800, lineHeight:1.15, marginBottom:12 },
  heroAccent: { color:'var(--accent)' },
  heroSub: { color:'var(--text-secondary)', fontSize:14, letterSpacing:'0.02em' },
  panel: { width:'100%', background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:28, boxShadow:'var(--shadow-card)' },
  tabs: { display:'flex', gap:2, background:'var(--bg-deep)', borderRadius:'var(--radius-md)', padding:3, marginBottom:24 },
  tab: { flex:1, padding:'8px 0', borderRadius:8, border:'none', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'var(--font-display)', transition:'all 0.15s' },
  tabActive: { background:'var(--bg-elevated)', color:'var(--text-primary)', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' },
  form: { display:'flex', flexDirection:'column', gap:16 },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: { fontSize:12, fontWeight:600, color:'var(--text-secondary)', letterSpacing:'0.04em' },
  error: { color:'var(--red)', fontSize:12, padding:'8px 12px', background:'var(--red-glow)', borderRadius:'var(--radius-sm)' },
  publicSection: { width:'100%' },
  sectionTitle: { fontSize:13, fontWeight:700, color:'var(--text-secondary)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12 },
  roomGrid: { display:'flex', flexDirection:'column', gap:8 },
  roomCard: { background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'12px 16px', cursor:'pointer', transition:'all 0.15s' },
  roomName: { fontWeight:600, marginBottom:6 },
  roomMeta: { display:'flex', alignItems:'center', justifyContent:'space-between' },
  features: { display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' },
  featurePill: { background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:99, padding:'5px 12px', fontSize:12, color:'var(--text-secondary)' },
}
