'use strict';

class Signal {
  constructor () {
    this.host = `${location.protocol}//${location.host}`
    this.isChannelReady = false
    this.socket = null

    // set valid events
    this.validEvents = [
      'media',
      'offer',
      'answer',
      'candidate',
      'bye',
      'reload',
      'enable-audio',
      'disable-audio'
    ]

    // initialize listeners collection with valid events
    this.listeners = {}
    this.validEvents.map((eventName) => {
      this.listeners[eventName] = []
    })

    this.config = {
      'iceServers': [{
        'url': 'stun:stun.l.google.com:19302'
      }]
    }

    this.sdpConstraints = {
      'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true
      }
    }
  } // end constructor

  start () {
    this.socket = io.connect()
    console.log(`-- started @ ${this.host}`)
    this.setEvents()

    // this.socket.on('message', (data) => {
    //   console.log('-- got message:', data)
    //   // this.socket.emit('message', 'EHLO')
    // })
  }

  createRoom () {
    var room = prompt('Enter room name:')
    room = room || 'default'
    console.log(`[ signal ]--> set room name: "${room}"`)

    this.socket.emit('create', room);
    console.log(`[ signal ]--> creating room "${room}"`);
  }

  setEvents() {
    this.socket.on('created', function(room) {
      console.log(`[ signal ]--> created room "${room}"`);
    });

    this.socket.on('full', function(room) {
      console.log(`[ signal ]--> room "${room}" is full`);
    });

    this.socket.on('join', function (room){
      console.log(`[ signal ]--> Another peer made a request to join room "${room}"`);
      console.log(`[ signal ]--> This peer is the initiator of room "${room}"`);
      this.isChannelReady = true;
    });

    this.socket.on('joined', function(room) {
      console.log('[ signal ]--> joined: ' + room);
      this.isChannelReady = true;
    });

    this.socket.on('log', function(array) {
      console.log.apply(console, array);
    });

    this.socket.on('error', function (error) {
      console.log('[ signal ]--> SOCKET ERROR:', error);
    });

    this.socket.on('message', (message) => this.onMessage(message))
  }

  onMessage (message) {
    console.log('[ signal ]--> got message:', message);
    if (!this.validEvents.includes(message.type)) throw new Error(`No message handler for type "${message.type}"`)

    // call event handlers for current event / message type
    this.listeners[message.type].map((listener) => listener(message))
  }

  on(event, callback) {
    if (!event in this.listeners) throw new Error(`ERROR: invalid event: ${event}`)

    // add listener
    this.listeners[event].push(callback)
  }

  send(message) {
    console.log('[ signal ]--> sending message:', message);
    this.socket.emit('message', message)
  }
}
