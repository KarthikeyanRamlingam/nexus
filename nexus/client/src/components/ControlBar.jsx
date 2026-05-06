import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
         MessageSquare, PenTool, PhoneOff, Users, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function ControlBar({
  roomId, mediaState,
  onToggleVideo, onToggleAudio, onToggleScreen,
  onToggleChat, onToggleWhiteboard, onLeave,
  participantCount, chatOpen, whiteboardOpen,
}) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={S.bar}>
      {/* Room info */}
      <div style={S.left}>
        <div style={S.roomCode}>
          <span style={S.codeLabel}>ROOM</span>
          <span style={S.code}>{roomId}</span>
          <button className="btn-icon" onClick={copyCode} style={{ width: 28, height: 28 }} title="Copy code">
            {copied ? <Check size={12} style={{ color: 'var(--green)' }} /> : <Copy size={12} />}
          </button>
        </div>
        <div style={S.participantPill}>
          <Users size={12} />
          <span>{participantCount}</span>
        </div>
      </div>

      {/* Media controls */}
      <div style={S.center}>
        <CtrlBtn
          onClick={onToggleAudio}
          active={mediaState.audio}
          danger={!mediaState.audio}
          title={mediaState.audio ? 'Mute' : 'Unmute'}
          Icon={mediaState.audio ? Mic : MicOff}
        />
        <CtrlBtn
          onClick={onToggleVideo}
          active={mediaState.video}
          danger={!mediaState.video}
          title={mediaState.video ? 'Stop video' : 'Start video'}
          Icon={mediaState.video ? Video : VideoOff}
        />
        <CtrlBtn
          onClick={onToggleScreen}
          active={!mediaState.screenSharing}
          highlight={mediaState.screenSharing}
          title={mediaState.screenSharing ? 'Stop sharing' : 'Share screen'}
          Icon={mediaState.screenSharing ? MonitorOff : Monitor}
        />

        <div style={S.divider} />

        <CtrlBtn
          onClick={onToggleChat}
          active={!chatOpen}
          highlight={chatOpen}
          title="Chat"
          Icon={MessageSquare}
        />
        <CtrlBtn
          onClick={onToggleWhiteboard}
          active={!whiteboardOpen}
          highlight={whiteboardOpen}
          title="Whiteboard"
          Icon={PenTool}
        />

        <div style={S.divider} />

        <button
          onClick={onLeave}
          style={S.leaveBtn}
          title="Leave room">
          <PhoneOff size={16} />
          <span>Leave</span>
        </button>
      </div>

      <div style={S.right} />
    </div>
  )
}

function CtrlBtn({ onClick, active, danger, highlight, title, Icon }) {
  return (
    <button onClick={onClick} title={title} style={{
      ...S.ctrlBtn,
      ...(danger ? S.ctrlDanger : {}),
      ...(highlight ? S.ctrlHighlight : {}),
    }}>
      <Icon size={16} />
    </button>
  )
}

const S = {
  bar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px',
    height: 60,
    background: 'var(--bg-surface)',
    borderTop: '1px solid var(--border)',
    flexShrink: 0,
  },
  left: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 },
  center: { display: 'flex', alignItems: 'center', gap: 6 },
  right: { flex: 1 },
  roomCode: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '5px 10px',
  },
  codeLabel: { fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' },
  code: { fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.06em' },
  participantPill: {
    display: 'flex', alignItems: 'center', gap: 5,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 99, padding: '4px 10px',
    fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
  },
  divider: { width: 1, height: 24, background: 'var(--border)', margin: '0 4px' },
  ctrlBtn: {
    width: 40, height: 40, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  ctrlDanger: {
    background: 'rgba(255,79,106,0.12)',
    color: 'var(--red)',
    borderColor: 'rgba(255,79,106,0.3)',
  },
  ctrlHighlight: {
    background: 'var(--accent-glow)',
    color: 'var(--accent)',
    borderColor: 'rgba(79,140,255,0.4)',
  },
  leaveBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '0 16px', height: 40, borderRadius: 10,
    background: 'rgba(255,79,106,0.12)',
    border: '1px solid rgba(255,79,106,0.3)',
    color: 'var(--red)', cursor: 'pointer',
    fontSize: 13, fontWeight: 600,
    fontFamily: 'var(--font-display)',
    transition: 'all 0.15s',
  },
}
