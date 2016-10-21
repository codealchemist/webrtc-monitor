'use strict';

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
  const $video = document.querySelector('video')
  const $reloadStreamerBtn = new El('reloadStreamer').get()
  const $toggleAudioBtn = new El('toggleAudio').get()
  $disconnect.show('inline')

  const signal = new Signal({uuid})
  const listen = new Listener({
    $video,
    signal,
    $reloadStreamerBtn,
    $toggleAudioBtn
  })

  signal.start()
  listen.start()
}

function disconnect () {
  let url = `${location.protocol}//${location.host}/listen`
  location.href = url
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
