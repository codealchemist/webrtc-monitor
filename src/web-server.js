const fs = require('fs')
const path = require('path')
const https = require('https')
const express = require('express')

class WebServer {
  constructor (params) {
    let {port=8443, credentials} = params || {}
    this.port = port
    this.credentials = credentials || {
      key: fs.readFileSync(`${__dirname}/../cert/privatekey.pem`, 'utf8'),
      cert: fs.readFileSync(`${__dirname}/../cert/certificate.pem`, 'utf8')
    }

    this.app = express()

    this.contentPath = path.join(__dirname, '../public')
    if (process.env.dist) this.contentPath = path.join(__dirname, '../dist')
    this.app.use(express.static(this.contentPath))
    console.log('-- static path:', this.contentPath)

    this.server = https.createServer(this.credentials, this.app)
  }

  getServer () {
    return this.server
  }

  start () {
    this.setRoutes()
    this.server.listen(this.port)
    console.log(`-- WEB SERVER started @ https://localhost:${this.port}`)
  }

  setRoutes () {
    let contentPath = this.contentPath

    this.app.get('/test', function (req, res) {
      res.send("Yes, I'm alive!")
    })

    this.app.get('/', function (req, res) {
      res.sendFile(`${contentPath}/index.html`)
    })

    this.app.get('/stream', function (req, res) {
      res.sendFile(`${contentPath}/stream.html`)
    })

    this.app.get('/listen', function (req, res) {
      res.sendFile(`${contentPath}/listen.html`)
    })
  }
}

module.exports = WebServer