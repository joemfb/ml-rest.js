'use strict'

var fetch = require('node-fetch')

// TODO: explicitly pass Promise?

module.exports = require('./rest.js')({
  fetch: fetch,
  Headers: fetch.Headers,
  Response: fetch.Response,
  URL: require('whatwg-url').URL,
  URLSearchParams: require('url-search-params')
})
