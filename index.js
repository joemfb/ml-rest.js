'use strict'

// set globals
// TODO: polyfill Promise?
require('fetch-everywhere')
require('./lib/url.js')
require('./lib/params.js')

module.exports = require('./rest.js')
