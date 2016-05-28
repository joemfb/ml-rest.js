/* eslint-env mocha */
'use strict'

var expect = require('chai').expect

var f = function () {}
var lib

describe('dependencies', function () {
  var deps
  var req = function () { require('../rest.js')(deps) }

  it('should require fetch', function () {
    expect(req).to.throw(/missing dependency: fetch/)
  })

  it('should require Headers', function () {
    deps = { fetch: f }
    expect(req).to.throw(/missing dependency: Headers/)
  })

  it('should require Response', function () {
    deps.Headers = f
    expect(req).to.throw(/missing dependency: Response/)
  })

  it('should require URL', function () {
    deps.Response = f
    expect(req).to.throw(/missing dependency: URL/)
  })

  it('should require URLSearchParams', function () {
    deps.URL = f
    expect(req).to.throw(/missing dependency: URLSearchParams/)
  })
})

describe('global document', function () {
  before(function () {
    GLOBAL.document = { baseURI: 'http://example.com' }
    lib = require('..')
  })

  after(function () {
    GLOBAL.document = undefined
  })

  it('should construct without opts', function () {
    expect(lib()).to.be.defined
  })
})
