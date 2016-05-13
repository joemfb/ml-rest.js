'use strict'

var expect = require('chai').expect

var f = function () {}
var lib

describe('dependencies', function () {
  var req = function () { require('../rest.js') }

  after(function () {
    GLOBAL.fetch = undefined
    GLOBAL.Response = undefined
    GLOBAL.Headers = undefined
    GLOBAL.URL = undefined
    GLOBAL.URLSearchParams = undefined
  })

  it('should require fetch', function () {
    GLOBAL.fetch = null
    expect(req).to.throw(/missing dependency: fetch/)
  })

  it('should require Headers', function () {
    GLOBAL.fetch = f
    GLOBAL.Headers = null
    expect(req).to.throw(/missing dependency: Headers/)
  })

  it('should require Response', function () {
    GLOBAL.Headers = f
    GLOBAL.Response = null
    expect(req).to.throw(/missing dependency: Response/)
  })

  it('should require URL', function () {
    GLOBAL.Response = f
    GLOBAL.URL = null
    expect(req).to.throw(/missing dependency: URL/)
  })

  it('should require URLSearchParams', function () {
    GLOBAL.URL = f
    GLOBAL.URLSearchParams = null
    expect(req).to.throw(/missing dependency: URLSearchParams/)
  })
})

describe('global document', function () {
  before(function () {
    GLOBAL.document = { baseURI: 'http://example.com' }
    lib = require('../index.js')
  })

  after(function () {
    GLOBAL.document = undefined
  })

  it('should construct without opts', function () {
    expect(lib()).to.be.defined
  })
})
