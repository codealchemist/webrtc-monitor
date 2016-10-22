'use strict';

let signal
let listen
const $video = document.querySelector('video')
const $toggleAudioBtn = new El('toggleAudio').get()
const $expandBtn = new El('expand').get()

// get stream uuid
let uuid
const $room = new El('room')
const $disconnect = new El('disconnect')
if (location.pathname !== '/listen' && location.pathname !== '/listen/') {
  // has uuid, join that room
  uuid = location.pathname.replace('/listen/', '')
  init()
} else {
  // no uuid, get one and then join specified room
  $room.show()
}

//------------------------------------------------------------

function init () {
  $disconnect.show('inline')

  signal = new Signal({uuid})
  listen = new Listener({
    $video,
    signal
  })

  signal.start()
  listen.start()
}

function disconnect () {
  let url = `${location.protocol}//${location.host}/listen`
  location.href = url
}

function toggleAudio () {
  // disable audio
  if ($toggleAudioBtn.className.match(/active/)) {
    $toggleAudioBtn.className = $toggleAudioBtn.className.replace(' active', '')
    listen.disableAudio()
    return
  }

  // enable audio
  $toggleAudioBtn.className+=' active'
  listen.enableAudio()
}

function expand () {
  // default size
  if ($expandBtn.className.match(/active/)) {
    $expandBtn.className = $expandBtn.className.replace(' active', '')
    $video.style.width = 'auto'
    return
  }

  // expand
  $expandBtn.className+=' active'
  $video.style.width = '100%'
}

function reloadStreamer () {
  listen.reloadStreamer()
}

function connect (input, event) {
  let code = event.keyCode

  // set on enter
  if (code === 13) {
    uuid = input.value.trim()
    let url = `${location.protocol}//${location.host}/listen/${uuid}`
    location.href = url
  }

  // do not disturb keyboard selection and backspace
  if (code < 65 || code === 91) return true

  // remote spaces
  input.value = input.value.replace(/\s/gi, '-')
  return true
}
