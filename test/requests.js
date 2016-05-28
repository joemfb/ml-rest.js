/* eslint-env mocha */
'use strict'

var expect = require('chai').expect
var nock = require('nock')

var URLSearchParams = require('url-search-params')
var URL = require('whatwg-url').URL
var Headers = require('node-fetch').Headers

var lib, inst

function assertBasicResp (resp) {
  expect(resp.ok).to.be.true
  expect(resp.status).to.equal(200)
  expect(resp.statusText).to.equal('OK')

  return resp.text()
  .then(function (txt) {
    expect(txt).to.equal('body')
  })
}

describe('construct/request', function () {
  before(function () {
    lib = require('../rest-node.js')
    inst = lib({ baseURI: 'http://example.com' })
  })

  it('should error without baseURI', function () {
    expect(lib).to.throw(/missing base uri/)
  })

  it('should construct with opts', function () {
    expect(inst).to.be.defined
  })

  it('should error with invalid request args', function () {
    var u = new URL('/blah', inst.baseURI)
    expect(function () { inst._request('/blah') }).to.throw(/bad url/)
    expect(function () { inst._request(u, {}) }).to.throw(/bad params/)
    expect(function () { inst._request(u, new URLSearchParams(), '') }).to.throw(/bad request/)
  })

  it('should fetch', function () {
    nock('http://example.com')
    .get('/blah')
    .reply(200, 'body')

    var u = new URL('/blah', inst.baseURI)
    var p = new URLSearchParams()

    return inst._request(u, p, {})
    .then(assertBasicResp)
  })

  it('should make an API request', function () {
    nock('http://example.com')
    .matchHeader('Content-Type', /application\/json/)
    .matchHeader('Accept', /application\/json/)
    .get('/v1/options')
    .reply(200, 'body')

    return inst.request('/v1/options')
    .then(assertBasicResp)
  })

  it('should make a request with params obj', function () {
    nock('http://example.com')
    .matchHeader('Content-Type', /application\/json/)
    .matchHeader('Accept', /application\/json/)
    .get('/v1/options')
    .query({ format: 'json' })
    .reply(200, 'body')

    return inst.request('/v1/options', { format: 'json' })
    .then(assertBasicResp)
  })

  it('should make a request with params obj (array/null)', function () {
    nock('http://example.com')
    .matchHeader('Content-Type', /application\/json/)
    .matchHeader('Accept', /application\/json/)
    .get('/v1/options')
    // .query({ format: 'json' })
    .query(function (query) {
      return query.format === 'json' &&
             query.arg[0] === 'a' &&
             query.arg[1] === 'b' &&
             query.other === undefined
    })
    .reply(200, 'body')

    return inst.request('/v1/options', { format: 'json', arg: ['a', 'b'], other: null })
    .then(assertBasicResp)
  })

  it('should make a request with URLSearchParams instance', function () {
    nock('http://example.com')
    .matchHeader('Content-Type', /application\/json/)
    .matchHeader('Accept', /application\/json/)
    .get('/v1/options')
    // note: doesn't require query, just matches if present
    .query({ format: 'json' })
    .reply(200, 'body')

    var p = new URLSearchParams()
    p.set('format', 'json')

    return inst.request('/v1/options', p)
    .then(assertBasicResp)
  })

  it('should make a request with header obj', function () {
    nock('http://example.com')
    .matchHeader('Content-Type', /application\/xml/)
    .matchHeader('Accept', /application\/json/)
    .get('/v1/options')
    .query({ format: 'json' })
    .reply(200, 'body')

    var h = { 'Content-Type': 'application/xml' }

    return inst.request('options', null, { headers: h })
    .then(assertBasicResp)
  })

  it('should make a request with Headers instance', function () {
    nock('http://example.com')
    .matchHeader('Content-Type', /application\/json/)
    .matchHeader('Accept', /application\/xml/)
    .get('/v1/options')
    .reply(200, 'body')

    var h = new Headers({ Accept: 'application/xml' })

    return inst.request('/options', null, { headers: h })
    .then(assertBasicResp)
  })
})
