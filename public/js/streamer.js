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
      this.pc = new RTCPeerConnection(null);
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
    // isAudioMuted = false;
    // isVideoMuted = false;
    pc.close()
    pc = null
  }
}
















// if (location.hostname !== 'localhost') {
//   requestTurn(
//     'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
//   );
// }





/////////////////////////////////////////////////////////





class Turn {
  constructor (config) {
    this.config = config
  }

  request (turnURL) {
    let turnExists = false;

    // check if we already have a turn server in config
    for (let i in this.config.iceServers) {
      if (this.config.iceServers[i].url.substr(0, 5) === 'turn:') {
        turnExists = true;
        turnReady = true;
        break;
      }
    }

    // get a turn server if we don't have one
    if (!turnExists) {
      console.log('Getting TURN server from ', turnURL);
      // No TURN server. Get one from computeengineondemand.appspot.com:
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          let turnServer = JSON.parse(xhr.responseText);
          console.log('Got TURN server: ', turnServer);
          this.config.iceServers.push({
            'url': `turn:${turnServer.username}@${turnServer.turn}`,
            'credential': turnServer.password
          });
          turnReady = true;
        }
      };
      xhr.open('GET', turnURL, true);
      xhr.send();
    }
  }
}







class Opus {
  // Set Opus as the default audio codec if it's present.
  prefer(sdp) {
    var sdpLines = sdp.split('\r\n');
    var mLineIndex;

    // Search for m line.
    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].search('m=audio') !== -1) {
        mLineIndex = i;
        break;
      }
    }
    if (mLineIndex === null) {
      return sdp;
    }

    // If Opus is available, set it as the default in m line.
    for (i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].search('opus/48000') !== -1) {
        var opusPayload = this.extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
        if (opusPayload) {
          sdpLines[mLineIndex] = this.setDefaultCodec(sdpLines[mLineIndex], opusPayload);
        }
        break;
      }
    }

    // Remove CN in m line and sdp.
    sdpLines = this.removeCN(sdpLines, mLineIndex);

    sdp = sdpLines.join('\r\n');
    return sdp;
  }

  extractSdp(sdpLine, pattern) {
    var result = sdpLine.match(pattern);
    return result && result.length === 2 ? result[1] : null;
  }

  // Set the selected codec to the first in m line.
  setDefaultCodec(mLine, payload) {
    var elements = mLine.split(' ');
    var newLine = [];
    var index = 0;
    for (var i = 0; i < elements.length; i++) {
      if (index === 3) { // Format of media starts from the fourth.
        newLine[index++] = payload; // Put target payload to the first.
      }
      if (elements[i] !== payload) {
        newLine[index++] = elements[i];
      }
    }
    return newLine.join(' ');
  }

  // Strip CN from sdp before CN constraints is ready.
  removeCN(sdpLines, mLineIndex) {
    var mLineElements = sdpLines[mLineIndex].split(' ');

    // Scan from end for the convenience of removing an item.
    for (var i = sdpLines.length - 1; i >= 0; i--) {
      var payload = this.extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
      if (payload) {
        var cnPos = mLineElements.indexOf(payload);
        if (cnPos !== -1) {
          // Remove CN payload from m line.
          mLineElements.splice(cnPos, 1);
        }
        // Remove CN line in sdp
        sdpLines.splice(i, 1);
      }
    }

    sdpLines[mLineIndex] = mLineElements.join(' ');
    return sdpLines;
  }
}
