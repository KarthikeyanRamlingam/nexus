import SimplePeer from 'simple-peer'

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
}

export class PeerManager {
  constructor(socket, localStream, onRemoteStream, onPeerClose) {
    this.socket = socket
    this.localStream = localStream
    this.onRemoteStream = onRemoteStream
    this.onPeerClose = onPeerClose
    this.peers = new Map()
  }

  _makePeer(targetId, initiator) {
    if (this.peers.has(targetId)) {
      const old = this.peers.get(targetId)
      if (!old.destroyed) old.destroy()
      this.peers.delete(targetId)
    }

    const peer = new SimplePeer({
      initiator,
      stream: this.localStream,
      config: ICE_SERVERS,
      trickle: true,
      offerOptions: { offerToReceiveAudio: true, offerToReceiveVideo: true },
    })

    peer.on('signal', (data) => {
      if (data.type === 'offer') {
        this.socket.emit('offer', { targetId, offer: data })
      } else if (data.type === 'answer') {
        this.socket.emit('answer', { targetId, answer: data })
      } else {
        // ICE candidate
        this.socket.emit('ice-candidate', { targetId, candidate: data })
      }
    })

    peer.on('stream', (remoteStream) => {
      console.log('📹 Got remote stream from', targetId, 'tracks:', remoteStream.getTracks().length)
      this.onRemoteStream(targetId, remoteStream)
    })

    peer.on('track', (track, stream) => {
      console.log('🎞 Got track from', targetId, track.kind)
      this.onRemoteStream(targetId, stream)
    })

    peer.on('error', (err) => {
      console.warn('Peer error with', targetId, err.message)
      this.peers.delete(targetId)
      this.onPeerClose(targetId)
    })

    peer.on('close', () => {
      this.peers.delete(targetId)
      this.onPeerClose(targetId)
    })

    this.peers.set(targetId, peer)
    return peer
  }

  // Called by the joining user — they initiate to each existing participant
  createPeer(targetId, initiator) {
    return this._makePeer(targetId, initiator)
  }

  // Called when we receive an offer (we are NOT the initiator)
  handleOffer(fromId, offer) {
    const peer = this._makePeer(fromId, false)
    peer.signal(offer)
  }

  handleAnswer(fromId, answer) {
    const peer = this.peers.get(fromId)
    if (peer && !peer.destroyed) peer.signal(answer)
  }

  handleIceCandidate(fromId, candidate) {
    const peer = this.peers.get(fromId)
    if (peer && !peer.destroyed) peer.signal(candidate)
  }

  replaceTrack(newStream) {
    this.localStream = newStream
    const [videoTrack] = newStream.getVideoTracks()
    this.peers.forEach((peer) => {
      if (peer.destroyed || !peer._pc) return
      const sender = peer._pc.getSenders().find(s => s.track?.kind === 'video')
      if (sender && videoTrack) sender.replaceTrack(videoTrack)
    })
  }

  destroyAll() {
    this.peers.forEach((peer) => { if (!peer.destroyed) peer.destroy() })
    this.peers.clear()
  }
}
