'use strict'

var params = require('url-search-params')

if (typeof window === 'object' && typeof window.URLSearchParams === 'undefined') {
  window.URLSearchParams = params
}
if (typeof GLOBAL === 'object' && typeof GLOBAL.URLSearchParams === 'undefined') {
  GLOBAL.URLSearchParams = params
}
