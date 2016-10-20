const WebServer = require('./web-server')
const WebSocket = require('./web-socket')

const port = process.env.PORT || 443
const server = new WebServer({port})
const socket = new WebSocket(server)

server.start()
socket.start()
