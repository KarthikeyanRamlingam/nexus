import { Mic, MicOff, Video, VideoOff, Monitor, Crown } from 'lucide-react'

export default function ParticipantsSidebar({ participants, localUser, localMediaState }) {
  const allParticipants = [
    { socketId: 'local', userId: localUser?.id, username: localUser?.username, ...localMediaState, isLocal: true },
    ...participants,
  ]

  return (
    <div style={S.sidebar}>
      <div style={S.header}>
        <span style={S.title}>Participants</span>
        <span style={S.count}>{allParticipants.length}</span>
      </div>
      <div style={S.list}>
        {allParticipants.map((p, i) => (
          <div key={p.socketId} style={S.row}>
            <div style={{ ...S.avatar, background: getColor(p.username) }}>
              {p.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={S.info}>
              <span style={S.name}>
                {p.username || 'Unknown'}
                {p.isLocal && <span style={S.you}> (You)</span>}
              </span>
              {i === 0 && <span style={S.hostBadge}><Crown size={8} /> Host</span>}
            </div>
            <div style={S.icons}>
              {p.screenSharing && <Monitor size={11} style={{ color: 'var(--accent)' }} />}
              {p.audio === false ? <MicOff size={11} style={{ color: 'var(--red)' }} />
                : <Mic size={11} style={{ color: 'var(--green)' }} />}
              {p.video === false ? <VideoOff size={11} style={{ color: 'var(--red)' }} />
                : <Video size={11} style={{ color: 'var(--green)' }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const PALETTE = ['#4f8cff','#22d37a','#ff4f6a','#b47fff','#f5a623','#00d4ff','#ff6b9d']
const getColor = (name) => PALETTE[(name?.charCodeAt(0) || 0) % PALETTE.length] + '33'

const S = {
  sidebar: {
    width: 220, background: 'var(--bg-surface)',
    borderLeft: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderBottom: '1px solid var(--border)',
  },
  title: { fontSize: 13, fontWeight: 700 },
  count: {
    fontSize: 11, fontWeight: 700,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 99, padding: '1px 7px', color: 'var(--text-secondary)',
  },
  list: { flex: 1, overflowY: 'auto', padding: '8px 0' },
  row: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 14px', transition: 'background 0.15s',
  },
  avatar: {
    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color: 'var(--text-primary)',
  },
  info: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 },
  name: { fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  you: { color: 'var(--text-muted)', fontWeight: 400 },
  hostBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 3,
    fontSize: 9, fontWeight: 700, color: 'var(--amber)',
    letterSpacing: '0.04em',
  },
  icons: { display: 'flex', gap: 4, flexShrink: 0 },
}
