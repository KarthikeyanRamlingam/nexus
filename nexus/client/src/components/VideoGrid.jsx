import VideoTile from './VideoTile'

export default function VideoGrid({ localStream, remoteStreams, localUser, participants, localMediaState }) {
  const remoteEntries = Object.entries(remoteStreams)
  const total = 1 + remoteEntries.length

  const gridStyle = getGridStyle(total)

  return (
    <div style={{ ...S.grid, ...gridStyle }}>
      {/* Local tile */}
      <VideoTile
        stream={localStream}
        user={localUser}
        isLocal
        mediaState={localMediaState}
        large={total === 1}
      />

      {/* Remote tiles */}
      {remoteEntries.map(([socketId, { stream }]) => {
        const participant = participants.find(p => p.socketId === socketId)
        return (
          <VideoTile
            key={socketId}
            stream={stream}
            user={participant}
            isLocal={false}
            mediaState={participant}
            large={total === 2}
          />
        )
      })}
    </div>
  )
}

function getGridStyle(count) {
  if (count === 1) return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }
  if (count === 2) return { gridTemplateColumns: '1fr 1fr' }
  if (count <= 4) return { gridTemplateColumns: 'repeat(2, 1fr)' }
  if (count <= 6) return { gridTemplateColumns: 'repeat(3, 1fr)' }
  return { gridTemplateColumns: 'repeat(4, 1fr)' }
}

const S = {
  grid: {
    flex: 1,
    display: 'grid',
    gap: 8,
    padding: 8,
    overflow: 'hidden',
    alignContent: 'center',
  },
}
