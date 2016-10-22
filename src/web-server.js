const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const express = require('express')
const ejs  = require('ejs');
const uuid = require('node-uuid')

class WebServer {
  constructor (params) {
    let {port=8443, credentials} = params || {}
    this.port = port
    this.app = express()
    this.contentPath = path.join(__dirname, '../public')
    if (process.env.dist) this.contentPath = path.join(__dirname, '../dist')
    this.credentials = credentials || {
      key: fs.readFileSync(`${__dirname}/../cert/privatekey.pem`, 'utf8'),
      cert: fs.readFileSync(`${__dirname}/../cert/certificate.pem`, 'utf8')
    }

    // use ejs
    this.app.engine('html', ejs.renderFile)
    this.app.set('view engine', 'ejs')
    this.app.set('views', `${this.contentPath}/partials`)

    // this.server = https.createServer(this.credentials, this.app)
    this.server = http.createServer(this.app)
  }

  getServer () {
    return this.server
  }

  start () {
    this.setRoutes()
    this.setStatic()
    this.server.listen(this.port)
    console.log(`-- WEB SERVER started @ http://localhost:${this.port}`)
  }

  setStatic () {
    // use static
    this.app.use(express.static(this.contentPath))
    console.log('-- static path:', this.contentPath)
  }

  getMetas () {
    return {
      title: 'WebRTC Monitor'
    }
  }

  setRoutes () {
    let contentPath = this.contentPath

    this.app.get('/test', (req, res) => {
      res.send("Yes, I'm alive!")
    })

    this.app.get('/', (req, res) => {
      res.render(`${contentPath}/index.html`, this.getMetas())
    })

    this.app.get('/stream/:guid', (req, res) => {
      let data = this.getMetas()
      data.title+=' - Stream Mode'
      console.log('-- stream mode, data', data)
      res.render(`${contentPath}/stream.html`, data)
    })

    this.app.get('/stream', (req, res) => {
      let guid = uuid.v1()
      let data = this.getMetas()
      data.title+=' - Stream Mode'
      res.redirect(`/stream/${guid}`)
    })

    this.app.get('/listen/:guid', (req, res) => {
      let data = this.getMetas()
      data.title+=' - Monitor Mode'
      res.render(`${contentPath}/listen.html`, data)
    })

    this.app.get('/listen', (req, res) => {
      let data = this.getMetas()
      data.title+=' - Monitor Mode'
      res.render(`${contentPath}/listen.html`, data)
    })
  }
}

module.exports = WebServer
