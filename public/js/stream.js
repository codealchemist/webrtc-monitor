'use strict';

// const $video = document.querySelector('video')
const signal = new Signal()
const stream = new Streamer({signal})

signal.start()
stream.start()
