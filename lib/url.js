'use strict'

var url = require('whatwg-url').URL

if (typeof window === 'object' && typeof window.URL === 'undefined') {
  window.URL = url
}
if (typeof GLOBAL === 'object' && typeof GLOBAL.URL === 'undefined') {
  GLOBAL.URL = url
}
