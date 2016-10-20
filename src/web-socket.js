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

    // Heroku won't actually allow us to use WebSockets
    // so we have to setup polling instead.
    // https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
    // this.io.configure(function () {
    //   this.io.set("transports", ["xhr-polling"]);
    //   this.io.set("polling duration", 10);
    // });
  }

  start () {
    if (!this.hasExternalServer) this.server.listen(this.port);
    this.setEvents()
    console.log(`-- WEB SOCKET started @ https://localhost:${this.port}`)
  }

  setEvents () {
    this.io.on('connection', (socket) => {
      socket.on('error', function (error) {
        console.log('-- SOCKET ERROR:', error);
      });

      console.log('-- web socket client connected')
      socket.on('event', this.onClientEvent);
      socket.on('disconnect', this.onClientDisconnect);
      socket.on('message', (message) => {
        console.log('-- client message:', message);
        socket.broadcast.emit('message', message);
      });
    });
  }

  onClientEvent (data) {
    console.log('-- client event:', data)
  }

  onClientDisconnect () {
    console.log('-- client disconnected')
  }
}

module.exports = WebSocket
