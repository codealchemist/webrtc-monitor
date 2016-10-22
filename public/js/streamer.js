'use strict';

class Streamer {
  constructor (params) {
    let {$video, signal} = params || {}
    this.signal = signal
    this.$video = $video
    this.stream = null
    this.pc = null
    this.constraints = {
      audio: true,
      video: true
    }

    this.config = {
      'iceServers': [{
        'url': 'stun:stun.l.google.com:19302'
      }]
    }
  }

  start () {
    this.setEvents()

    // request media access
    navigator.mediaDevices.getUserMedia(this.constraints)
    .then((stream) => this.gotStream(stream))
    .catch(function(e) {
      alert('Error: ' + e.name)
      console.log('ERROR getting media:', e)
      console.log('STACK TRACE:', e.stack)
    })
  }

  setEvents () {
    // close peer connection when window is closed
    window.onbeforeunload = function() {
      sendMessage('bye')
    }

    // listen to signaling
    this.signal.on('offer', (message) => this.onOffer(message))
    this.signal.on('answer', (message) => this.onAnswer(message))
    this.signal.on('candidate', (message) => this.onRemoteIceCandidate(message))
    this.signal.on('media', (message) => this.onMedia(message))
    this.signal.on('bye', (message) => this.onBye(message))
    this.signal.on('reload', (message) => this.onReload(message))
    this.signal.on('enable-audio', (message) => this.onEnableAudio(message))
    this.signal.on('disable-audio', (message) => this.onDisableAudio(message))
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

  onRemoteIceCandidate (message) {
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

  onReload (message) {
    console.log('-- reload streamer:', message)
    location.reload()
  }

  onEnableAudio (message) {
    console.log('-- enable audio:', message)
    this.stream.getAudioTracks()[0].enabled = true
  }

  onDisableAudio (message) {
    console.log('-- disable audio:', message)
    this.stream.getAudioTracks()[0].enabled = false
  }

  gotStream (stream) {
    console.log('Adding local stream')
    stream.getAudioTracks()[0].enabled = false
    this.stream = stream
    this.signal.send({type: 'media'})
    this.connect()
  }

  getStream () {
    return this.stream
  }

  connect () {
    this.createPeerConnection()
    this.pc.addStream(this.stream)
    this.offer()
  }

  createPeerConnection() {
    try {
      this.pc = new RTCPeerConnection(this.config);
      this.pc.onicecandidate = (event) => this.onLocalIceCandidate(event);
      // this.pc.onaddstream = (evnet) => this.onRemoteStreamAdded(event);
      // this.pc.onremovestream = (event) => this.onRemoteStreamRemoved(event);
      console.log('Created RTCPeerConnnection');
    } catch (e) {
      console.log('Failed to create PeerConnection, exception: ' + e.message);
      alert('Cannot create RTCPeerConnection object.');
      return;
    }
  }

  onLocalIceCandidate (event) {
    console.log('-- got local ice candidate event: ', event);
    if (!event.candidate) {
      console.log('End of candidates.')
      return
    }

    this.signal.send({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  }

  handleCreateOfferError (event) {
    console.log('createOffer() error: ', event);
  }

  offer () {
    console.log('-- offer: Sending offer to peer');
    this.pc.createOffer(
      (sd) => this.describe(sd),
      (error) => this.handleCreateOfferError(error)
    );
  }

  answer () {
    this.connect()

    console.log('-- answer: Sending answer to peer.');
    this.pc.createAnswer().then(
      (sd) => this.describe(sd),
      (error) => this.onCreateSessionDescriptionError(error)
    );
  }

  describe (sessionDescription) {
    // TODO
    // Set Opus as the preferred codec in SDP if Opus is present.
    // sessionDescription.sdp = preferOpus(sessionDescription.sdp);

    this.pc.setLocalDescription(sessionDescription, () => {
      console.log('set local session description', sessionDescription)
      this.signal.send(sessionDescription) // send offer message
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
    pc.close()
    pc = null
  }
}
