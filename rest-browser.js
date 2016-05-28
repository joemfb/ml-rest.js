(function (self) {
  'use strict'

  // from https://github.com/bestiejs/punycode.js/blob/master/punycode.js#L524
  // fixes webpack dev server; not sure exactly when it's needed ...
  var g = typeof global === 'object' && global
  if (g.global === g || g.window === g || g.self === g) {
    self = g
  }

  // TODO: optionally polyfill Promise?

  // set globals
  require('whatwg-fetch')

  module.exports = require('./rest.js')({
    URL: self.URL || require('whatwg-url').URL,
    URLSearchParams: self.URLSearchParams || require('url-search-params')
  })
})(this)
