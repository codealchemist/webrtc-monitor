'use strict';

// get stream uuid
const uuid = location.pathname.replace('/listen/', '')

const $video = document.querySelector('video')
const $reloadStreamerBtn = document.getElementById('reloadStreamer')
const $toggleAudioBtn = document.getElementById('toggleAudio')

const signal = new Signal({uuid})
const listen = new Listener({
  $video,
  signal,
  $reloadStreamerBtn,
  $toggleAudioBtn
})

signal.start()
listen.start()
