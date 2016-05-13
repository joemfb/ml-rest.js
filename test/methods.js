/* eslint-env mocha */
'use strict'

var expect = require('chai').expect
var nock = require('nock')

var lib, inst

// TODO: https://www.npmjs.com/package/fetch-mock ?

function assertBasicResp (resp) {
  expect(resp.ok).to.be.true
  expect(resp.status).to.equal(200)
  expect(resp.statusText).to.equal('OK')

  return resp.text()
  .then(function (txt) {
    expect(txt).to.equal('body')
  })
}

describe('methods', function () {
  before(function () {
    lib = require('../index.js')
    inst = lib.create({ baseURI: 'http://example.com' })
  })

  it('should search', function () {
    var query = { query: { queries: { 'and-query': [] } } }

    nock('http://example.com')
    .post('/v1/search', JSON.stringify(query))
    .query({ options: 'all' })
    .reply(200, 'body')

    return inst.search(query, { options: 'all' })
    .then(assertBasicResp)
  })

  it('should search without query', function () {
    nock('http://example.com')
    .post('/v1/search')
    .query({ options: 'all' })
    .reply(200, 'body')

    return inst.search({ options: 'all' })
    .then(assertBasicResp)
  })

  it('should disambiguate query and params', function () {
    var combined = { options: { 'return-query': 1 } }

    nock('http://example.com')
    .post('/v1/search', JSON.stringify(combined))
    .reply(200, 'body')

    return inst.search(combined)
    .then(assertBasicResp)
  })

  it('should qbe', function () {
    expect(inst.qbe).not.to.be.undefined
  })

  it('should get default suggestions (1)', function () {
    nock('http://example.com')
    .post('/v1/suggest')
    .reply(200, 'body')

    return inst.suggest()
    .then(assertBasicResp)
  })

  it('should get default suggestions (2)', function () {
    nock('http://example.com')
    .post('/v1/suggest')
    .reply(200, 'body')

    return inst.suggest('')
    .then(assertBasicResp)
  })

  it('should get suggestions', function () {
    nock('http://example.com')
    .post('/v1/suggest')
    .query({ 'partial-q': 'blah' })
    .reply(200, 'body')

    return inst.suggest('blah')
    .then(assertBasicResp)
  })

  it('should get suggestions with params', function () {
    nock('http://example.com')
    .post('/v1/suggest')
    .query({
      'partial-q': 'blah',
      limit: 5
    })
    .reply(200, 'body')

    return inst.suggest('blah', { limit: 5 })
    .then(assertBasicResp)
  })

  it('should get suggestions with query', function () {
    var query = { query: { queries: { 'and-query': [] } } }

    nock('http://example.com')
    .post('/v1/suggest', JSON.stringify(query))
    .query({ 'partial-q': 'blah' })
    .reply(200, 'body')

    return inst.suggest('blah', query)
    .then(assertBasicResp)
  })

  it('should list values definitions', function () {
    nock('http://example.com')
    .get('/v1/values')
    .reply(200, 'body')

    return inst.listValues()
    .then(assertBasicResp)
  })

  it('should get values', function () {
    nock('http://example.com')
    .post('/v1/values/name')
    .reply(200, 'body')

    return inst.values('name')
    .then(assertBasicResp)
  })

  it('should error without values definition name', function () {
    expect(inst.values).to.throw(/missing values definition name/)
  })

  it('should get values with query', function () {
    var query = { query: { queries: { 'and-query': [] } } }

    nock('http://example.com')
    .post('/v1/values/blah', JSON.stringify(query))
    .reply(200, 'body')

    return inst.values('blah', query)
    .then(assertBasicResp)
  })

  it('should get values with params', function () {
    nock('http://example.com')
    .post('/v1/values/blah')
    .query({ limit: 10 })
    .reply(200, 'body')

    return inst.values('blah', { limit: 10 })
    .then(assertBasicResp)
  })

  it('should get a doc', function () {
    var uri = '/path/name.json'

    nock('http://example.com')
    .get('/v1/documents')
    .query({ uri: uri })
    .reply(200, 'body')

    return inst.doc(uri)
    .then(assertBasicResp)
  })

  it('should error getting a doc without a URI', function () {
    expect(inst.doc).to.throw(/missing document URI/)
  })

  it('should create a doc', function () {
    var content = { key: 'val' }
    var uri = '/path/name.json'

    nock('http://example.com')
    .put('/v1/documents', JSON.stringify(content))
    .query({ uri: uri })
    .reply(200, 'body')

    return inst.create(uri, content)
    .then(assertBasicResp)
  })

  it('should create a doc without a URI', function () {
    var content = { key: 'val' }

    nock('http://example.com')
    .post('/v1/documents', JSON.stringify(content))
    .reply(200, 'body')

    return inst.create(content)
    .then(assertBasicResp)
  })

  it('should update a doc', function () {
    var content = { key: 'val' }
    var uri = '/path/name.json'

    nock('http://example.com')
    .put('/v1/documents', JSON.stringify(content))
    .query({ uri: uri })
    .reply(200, 'body')

    return inst.update(uri, content)
    .then(assertBasicResp)
  })

  it('should error updating a doc without a URI', function () {
    expect(inst.update).to.throw(/missing document URI/)
  })

  it('should delete a doc', function () {
    var uri = '/path/name.json'

    nock('http://example.com')
    .delete('/v1/documents')
    .query({ uri: uri })
    .reply(200, 'body')

    return inst.delete(uri)
    .then(assertBasicResp)
  })

  it('should error deleting a doc without a URI', function () {
    expect(inst.delete).to.throw(/missing document URI/)
  })

  it('should delete docs by URI', function () {
    var uris = [
      '/path/name1.json',
      '/path/name2.json',
      '/path/name3.json'
    ]

    nock('http://example.com')
    .delete('/v1/documents')
    .query({ uri: uris })
    .reply(200, 'body')

    return inst.deleteAll(uris)
    .then(assertBasicResp)
  })

  it('should delete docs by group', function () {
    nock('http://example.com')
    .delete('/v1/search')
    .query({ collection: 'docs' })
    .reply(200, 'body')

    return inst.deleteAll({ collection: 'docs' })
    .then(assertBasicResp)
  })

  it('should delete all docs', function () {
    nock('http://example.com')
    .delete('/v1/search')
    .reply(200, 'body')

    return inst.deleteAll()
    .then(assertBasicResp)
  })

  it('should error on bad delete args', function () {
    var f = function () {
      inst.deleteAll(null)
    }

    expect(f).to.throw(/bad args/)
  })

  it('should patch a doc', function () {
    expect(inst.patch).not.to.be.undefined
  })

  it('should list graphs', function () {
    nock('http://example.com')
    .matchHeader('Accept', /text\/uri-list/)
    .get('/v1/graphs')
    .reply(200, 'body')

    return inst.listGraphs()
    .then(function (resp) {
      expect(resp.ok).to.be.true
      expect(resp.status).to.equal(200)

      return resp.json()
      .then(function (data) {
        expect(data).to.be.an.instanceof(Array)
        expect(data.length).to.equal(1)
        expect(data[0]).to.equal('body')
      })
    })
  })

  it('should get the default graph', function () {
    nock('http://example.com')
    .matchHeader('Accept', /application\/rdf\+json/)
    .get('/v1/graphs')
    .query({ default: '' })
    .reply(200, 'body')

    return inst.graph()
  })

  it('should get the default graph with params', function () {
    nock('http://example.com')
    .matchHeader('Accept', /application\/rdf\+json/)
    .get('/v1/graphs')
    .query({
      default: '',
      category: 'metadata'
    })
    .reply(200, 'body')

    return inst.graph({ category: 'metadata' })
  })

  it('should get a graph', function () {
    nock('http://example.com')
    .matchHeader('Accept', /application\/rdf\+json/)
    .get('/v1/graphs')
    .query({ graph: 'my-graph' })
    .reply(200, 'body')

    return inst.graph('my-graph')
  })

  it('should get a graph with params', function () {
    nock('http://example.com')
    .matchHeader('Accept', /application\/rdf\+json/)
    .get('/v1/graphs')
    .query({
      graph: 'my-graph',
      category: 'metadata'
    })
    .reply(200, 'body')

    return inst.graph('my-graph', { category: 'metadata' })
  })

  it('should get things for iri', function () {
    var iri = 'my-iri'

    nock('http://example.com')
    .matchHeader('Accept', /application\/rdf\+json/)
    .get('/v1/graphs/things')
    .query({ iri: iri })
    .reply(200, 'body')

    return inst.things(iri)
  })

  it('should get things for iris', function () {
    var iris = ['my-iri1', 'my-iri2']

    nock('http://example.com')
    .matchHeader('Accept', /application\/rdf\+json/)
    .get('/v1/graphs/things')
    .query({ iri: iris })
    .reply(200, 'body')

    return inst.things(iris)
  })

  it('should error on bad things args', function () {
    var f = function () {
      inst.things(null)
    }

    expect(f).to.throw(/bad args/)
  })

  it('should evaluate a sparql query', function () {
    expect(inst.sparql).not.to.be.undefined
  })

  it('should list options', function () {
    nock('http://example.com')
    .get('/v1/config/query')
    .reply(200, 'body')

    return inst.listOptions()
    .then(assertBasicResp)
  })

  it('should get options', function () {
    nock('http://example.com')
    .get('/v1/config/query/all')
    .reply(200, 'body')

    return inst.options('all')
    .then(assertBasicResp)
  })

  it('should error getting options without name', function () {
    expect(inst.options).to.throw(/missing name/)
  })

  it('should invoke an extension', function () {
    expect(inst.extension).not.to.be.undefined
  })

  it('should eval an expression', function () {
    expect(inst.eval).not.to.be.undefined
  })

  it('should invoke a module', function () {
    expect(inst.invoke).not.to.be.undefined
  })
})
