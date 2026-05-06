import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, X } from 'lucide-react'

export default function ChatPanel({ messages, onSend, currentUser, onClose }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    onSend(text)
    setInput('')
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Convert to base64 data URL for peer-to-peer sharing
    const reader = new FileReader()
    reader.onload = (ev) => {
      onSend(ev.target.result, 'file', {
        fileName: file.name,
        fileSize: file.size,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div style={S.panel}>
      {/* Header */}
      <div style={S.header}>
        <span style={S.title}>Chat</span>
        <button className="btn-icon" onClick={onClose} style={{width:28,height:28,border:'none'}}>
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div style={S.messages}>
        {messages.length === 0 && (
          <div style={S.empty}>No messages yet.<br/>Say hello 👋</div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id
          return (
            <div key={msg.id || msg.timestamp} style={{ ...S.msgRow, ...(isMe ? S.msgRowMe : {}) }}>
              {!isMe && <div style={S.msgAvatar}>{msg.sender?.[0]?.toUpperCase()}</div>}
              <div style={{ ...S.bubble, ...(isMe ? S.bubbleMe : S.bubbleOther) }}>
                {!isMe && <div style={S.sender}>{msg.sender}</div>}
                {msg.type === 'file' ? (
                  <a href={msg.content} download={msg.fileName} style={S.fileMsg}>
                    <div style={S.fileIcon}>📎</div>
                    <div>
                      <div style={S.fileName}>{msg.fileName}</div>
                      <div style={S.fileSize}>{formatFileSize(msg.fileSize)}</div>
                    </div>
                  </a>
                ) : (
                  <p style={S.msgText}>{msg.content}</p>
                )}
                <div style={S.time}>{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} style={S.inputRow}>
        <input
          type="file" ref={fileRef} style={{ display: 'none' }}
          onChange={handleFile}
        />
        <button type="button" className="btn-icon" style={S.attachBtn}
          onClick={() => fileRef.current?.click()}>
          <Paperclip size={14} />
        </button>
        <input
          className="input" style={S.textInput}
          placeholder="Message…" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(e)}
        />
        <button type="submit" className="btn btn-primary" style={S.sendBtn} disabled={!input.trim()}>
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}

const S = {
  panel: {
    width: 300, display: 'flex', flexDirection: 'column',
    background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
    height: '100%',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  title: { fontWeight: 700, fontSize: 14 },
  messages: {
    flex: 1, overflowY: 'auto', padding: '12px 12px',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  empty: {
    textAlign: 'center', color: 'var(--text-muted)',
    fontSize: 12, margin: 'auto', lineHeight: 1.8,
  },
  msgRow: { display: 'flex', gap: 6, alignItems: 'flex-end' },
  msgRowMe: { flexDirection: 'row-reverse' },
  msgAvatar: {
    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
  },
  bubble: {
    maxWidth: '75%', padding: '8px 10px',
    borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 3,
  },
  bubbleOther: { background: 'var(--bg-elevated)', borderBottomLeftRadius: 3 },
  bubbleMe: { background: 'var(--accent)', borderBottomRightRadius: 3 },
  sender: { fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 2 },
  msgText: { fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word' },
  time: { fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'right', marginTop: 2 },
  fileMsg: {
    display: 'flex', alignItems: 'center', gap: 8,
    textDecoration: 'none', color: 'inherit',
    background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '6px 8px',
  },
  fileIcon: { fontSize: 18 },
  fileName: { fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' },
  fileSize: { fontSize: 10, color: 'var(--text-muted)' },
  inputRow: {
    display: 'flex', gap: 6, padding: '10px 12px',
    borderTop: '1px solid var(--border)', flexShrink: 0,
    alignItems: 'center',
  },
  attachBtn: { width: 34, height: 34, flexShrink: 0 },
  textInput: { flex: 1, padding: '8px 10px', fontSize: 13 },
  sendBtn: { width: 34, height: 34, padding: 0, flexShrink: 0 },
}
