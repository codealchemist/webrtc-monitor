'use strict';

// get stream uuid
const uuid = location.pathname.replace('/stream/', '')

const signal = new Signal({uuid})
const stream = new Streamer({signal})

signal.start()
stream.start()
