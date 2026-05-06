import { useEffect, useRef } from 'react'
import { MicOff, VideoOff, Monitor } from 'lucide-react'

export default function VideoTile({ stream, user, isLocal, mediaState, large }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const label = user?.username || (isLocal ? 'You' : 'Participant')
  const showVideo = mediaState?.video !== false
  const showAudio = mediaState?.audio !== false
  const isScreenShare = mediaState?.screenSharing

  return (
    <div style={{ ...S.tile, ...(large ? S.tileLarge : {}) }}>
      {stream && showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          style={{ ...S.video, ...(isLocal && !isScreenShare ? S.mirrored : {}) }}
        />
      ) : (
        <div style={S.noVideo}>
          <div style={S.avatarCircle}>
            {label[0]?.toUpperCase()}
          </div>
        </div>
      )}

      {/* Overlay */}
      <div style={S.overlay}>
        <div style={S.nameRow}>
          {isScreenShare && (
            <span style={S.screenBadge}><Monitor size={10} /> Screen</span>
          )}
          <span style={S.name}>{isLocal ? `${label} (You)` : label}</span>
        </div>
        <div style={S.icons}>
          {!showAudio && <div style={S.iconBadge}><MicOff size={10} /></div>}
          {!showVideo && <div style={S.iconBadge}><VideoOff size={10} /></div>}
        </div>
      </div>

      {/* Speaking ring */}
      {showAudio && !isLocal && (
        <div style={S.speakRing} />
      )}
    </div>
  )
}

const S = {
  tile: {
    position: 'relative',
    background: '#0d1120',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #1e2438',
    aspectRatio: '16/9',
    minWidth: 0,
  },
  tileLarge: {
    aspectRatio: '16/9',
    flex: 1,
  },
  video: {
    width: '100%', height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  mirrored: { transform: 'scaleX(-1)' },
  noVideo: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #0d1120, #161b2a)',
  },
  avatarCircle: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'rgba(79,140,255,0.15)',
    border: '2px solid rgba(79,140,255,0.3)',
    color: '#4f8cff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 700,
  },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: '20px 10px 8px',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.65))',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  nameRow: { display: 'flex', alignItems: 'center', gap: 6 },
  name: {
    fontSize: 11, fontWeight: 600, color: '#fff',
    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
  },
  screenBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 3,
    background: 'rgba(79,140,255,0.8)', color: '#fff',
    borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 700,
  },
  icons: { display: 'flex', gap: 4 },
  iconBadge: {
    background: 'rgba(255,79,106,0.85)', color: '#fff',
    borderRadius: 4, padding: '2px 4px',
    display: 'flex', alignItems: 'center',
  },
  speakRing: {
    position: 'absolute', inset: -1,
    borderRadius: 12,
    border: '2px solid rgba(34,211,122,0)',
    pointerEvents: 'none',
  },
}
