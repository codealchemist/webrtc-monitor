const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const express = require('express')
const uuid = require('node-uuid')

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

    // this.server = https.createServer(this.credentials, this.app)
    this.server = http.createServer(this.app)
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
      console.log('-- serve index:', `${contentPath}/index.html`)
      res.sendFile(`${contentPath}/index.html`)
    })

    this.app.get('/stream/:guid', function (req, res) {
      res.sendFile(`${contentPath}/stream.html`)
    })

    this.app.get('/stream', function (req, res) {
      let guid = uuid.v1()
      res.redirect(`/stream/${guid}`)
    })

    this.app.get('/listen/:guid', function (req, res) {
      res.sendFile(`${contentPath}/listen.html`)
    })

    this.app.get('/listen', function (req, res) {
      res.sendFile(`${contentPath}/listen.html`)
    })
  }
}

module.exports = WebServer
