const WebServer = require('./web-server')
const WebSocket = require('./web-socket')

const server = new WebServer()
const socket = new WebSocket(server)

server.start()
socket.start()
