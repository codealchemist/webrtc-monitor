'use strict';

const $video = document.querySelector('video')
const $reloadStreamerBtn = document.getElementById('reloadStreamer')
const $toggleAudioBtn = document.getElementById('toggleAudio')

const signal = new Signal()
const listen = new Listener({
  $video,
  signal,
  $reloadStreamerBtn,
  $toggleAudioBtn
})

signal.start()
listen.start()
