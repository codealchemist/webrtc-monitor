const https = require('https')
const WebSocketServer = require('websocket').server
const io = require('socket.io')

class WebSocket {
  constructor (params) {
    let {port=8080, server, credentials} = params || {}
    this.port = port
    this.credentials = credentials || {
      key: fs.readFileSync(`${__dirname}/../cert/privatekey.pem`, 'utf8'),
      cert: fs.readFileSync(`${__dirname}/../cert/certificate.pem`, 'utf8')
    }

    this.hasExternalServer = false
    if (server) this.hasExternalServer = true
    console.log('-- socket has external server:', this.hasExternalServer)

    this.channels = {}
    this.server = server || https.createServer(this.credentials)
    this.io = io(this.server);
  }

  start () {
    if (!this.hasExternalServer) this.server.listen(this.port);
    this.setEvents()
    console.log(`-- WEB SOCKET started @ http://localhost:${this.port}`)
  }

  setEvents () {
    this.io.on('connection', (socket) => {
      let clientsCount = this.io.engine.clientsCount
      console.log(`-- client connected | total ${clientsCount}`)

      socket.on('room', (room) => {
        socket.join(room)
        socket.room = room
        console.log(`-- JOINED ROOM "${room}"`)
      })

      socket.on('error', (error) => {
        console.log('-- SOCKET ERROR:', error);
      })

      console.log('-- web socket client connected')
      // socket.on('event', () => this.onClientEvent())
      socket.on('disconnect', () => this.onClientDisconnect());
      socket.on('message', (message) => {
        // console.log('-- client message:', message)
        console.log(`-- send message to room: "${socket.room}"`)
        socket.to(socket.room).emit('message', message)
      })
    })
  }

  onClientEvent (data) {
    // console.log('-- client event:', data)
  }

  onClientDisconnect () {
    let clientsCount = this.io.engine.clientsCount
    console.log(`-- client disconnected | total ${clientsCount}`)
  }
}

module.exports = WebSocket
