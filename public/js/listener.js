'use strict'

class Listener {
  constructor (params) {
    let {$video, signal} = params || {}
    this.signal = signal
    this.$video = $video
    this.stream = null
    this.pc = null

    this.config = {
      'iceServers': [{
        'url': 'stun:stun.l.google.com:19302'
      }]
    }
  }

  start () {
    this.setEvents()
    this.connect()
  }

  setEvents () {
    // close peer connection when window is closed
    window.onbeforeunload = function() {
      sendMessage('bye')
    }

    // listen to signaling
    this.signal.on('offer', (message) => this.onOffer(message))
    this.signal.on('answer', (message) => this.onAnswer(message))
    this.signal.on('candidate', (message) => this.onCandidate(message))
    this.signal.on('media', (message) => this.onMedia(message))
    this.signal.on('bye', (message) => this.onBye(message))
  }

  reloadStreamer () {
    this.signal.send({type: 'reload'})
  }

  enableAudio () {
    this.signal.send({type: 'enable-audio'})
  }

  disableAudio () {
    this.signal.send({type: 'disable-audio'})
  }

  onOffer (message) {
    console.log('-- got offer:', message)

    this.connect()
    this.pc.setRemoteDescription(new RTCSessionDescription(message), () => {
      this.answer()
    })
  }

  onAnswer (message) {
    console.log('-- got answer:', message)
    this.pc.setRemoteDescription(new RTCSessionDescription(message))
  }

  onCandidate (message) {
    console.log('-- got candidate:', message)
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    })
    this.pc.addIceCandidate(candidate)
  }

  onMedia (message) {
    console.log('-- got media:', message)
    this.connect()
  }

  onBye (message) {
    console.log('-- client disconnected:', message)
    this.handleRemoteHangup()
  }

  connect () {
    this.createPeerConnection()
    this.offer()
  }

  createPeerConnection() {
    try {
      this.pc = new RTCPeerConnection(this.config);
      this.pc.onicecandidate = (event) => this.onIceCandidate(event);
      this.pc.onaddstream = (evnet) => this.onRemoteStreamAdded(event);
      this.pc.onremovestream = (event) => this.onRemoteStreamRemoved(event);
      console.log('Created RTCPeerConnnection');
    } catch (e) {
      console.log('Failed to create PeerConnection, exception: ' + e.message);
      alert('Cannot create RTCPeerConnection object.')
      return;
    }
  }

  onIceCandidate (event) {
    console.log('-- got ice candidate event: ', event)
    if (!event.candidate) {
      console.log('End of candidates.')
      return
    }

    this.signal.send({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    })
  }

  onRemoteStreamAdded (event) {
    console.log('Remote stream added.')
    this.$video.src = window.URL.createObjectURL(event.stream)
    this.stream = event.stream
    window.stream = event.stream
  }

  handleCreateOfferError (event) {
    console.log('createOffer() error: ', event)
  }

  offer () {
    console.log('-- offer: Sending offer to peer')
    this.pc.createOffer(
      (sd) => this.describe(sd),
      (error) => this.handleCreateOfferError(error)
    )
  }

  answer () {
    console.log('-- answer: Sending answer to peer.');
    this.pc.createAnswer().then(
      (sd) => this.describe(sd),
      (error) => this.onCreateSessionDescriptionError(error)
    )
  }

  describe (sessionDescription) {
    // TODO
    // Set Opus as the preferred codec in SDP if Opus is present.
    // sessionDescription.sdp = preferOpus(sessionDescription.sdp);

    this.pc.setLocalDescription(sessionDescription, () => {
      console.log('set local session description', sessionDescription)
      this.signal.send(sessionDescription)
    })
  }

  onCreateSessionDescriptionError(error) {
    console.error('Failed to create session description: ', error.toString())
    console.error('STACK TRACE:', error.stack)
  }

  onRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event)
  }

  hangup() {
    console.log('Hanging up.')
    this.stop()
    this.signal.send('bye')
  }

  handleRemoteHangup() {
    console.log('Session terminated.')
    stop()
  }

  stop() {
    isStarted = false
    pc.close()
    pc = null
  }
}
