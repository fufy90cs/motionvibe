'use strict';
const { EventEmitter } = require('events');

// Shared event bus — contact.js emits, admin SSE listens
const emitter = new EventEmitter();
emitter.setMaxListeners(50); // allow up to 50 concurrent admin tabs

module.exports = emitter;
