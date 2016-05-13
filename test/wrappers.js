/* eslint-env mocha */
'use strict'

var expect = require('chai').expect
var nock = require('nock')

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

describe('wrappers:', function () {
  before(function () {
    lib = require('../index.js')
    inst = lib({ baseURI: 'http://example.com' })
  })

  describe('database', function () {
    it('should constract a database wrapper', function () {
      var db = inst.database('name')

      expect(db).to.be.an.instanceof(lib)
    })

    it('should error binding to a database without a name', function () {
      expect(inst.database).to.throw(/missing database name/)
    })

    it('should bind to a database', function () {
      var db = inst.database('name')
      var uri = '/path/name.json'

      nock('http://example.com')
      .get('/v1/documents')
      .query({
        uri: uri,
        database: 'name'
      })
      .reply(200, 'body')

      return db.doc(uri)
      .then(assertBasicResp)
    })
  })

  describe('transactions', function () {
    it('should open a transaction', function (done) {
      var txId = '123'

      nock('http://example.com')
      .post('/v1/transactions')
      .reply(200, { 'transaction-status': { 'transaction-id': txId } })

      var tx = inst.transaction()
      expect(tx.status).to.equal('uninitialized')

      setTimeout(function () {
        expect(tx.status).to.equal('open')
        done()
      }, 10)
    })

    it('should get transaction details', function () {
      var txId = '123'

      nock('http://example.com')
      .post('/v1/transactions')
      .reply(200, { 'transaction-status': { 'transaction-id': txId } })

      var tx = inst.transaction()
      expect(tx.status).to.equal('uninitialized')

      nock('http://example.com')
      .get('/v1/transactions/' + txId)
      .reply(200, 'body')

      return tx.details()
      .then(assertBasicResp)
    })

    it('should bind to a transaction', function () {
      var txId = '123'

      nock('http://example.com')
      .post('/v1/transactions')
      .reply(200, { 'transaction-status': { 'transaction-id': txId } })

      var tx = inst.transaction()
      expect(tx.status).to.equal('uninitialized')

      var content = { key: 'val' }
      var uri = '/path/name.json'

      nock('http://example.com')
      .put('/v1/documents', JSON.stringify(content))
      .query({
        uri: uri,
        txid: txId
      })
      .reply(200, 'body')

      return tx.update(uri, content)
      .then(assertBasicResp)
    })

    it('should commit a transaction', function () {
      var txId = '123'

      nock('http://example.com')
      .post('/v1/transactions')
      .reply(200, { 'transaction-status': { 'transaction-id': txId } })

      var tx = inst.transaction()
      expect(tx.status).to.equal('uninitialized')

      nock('http://example.com')
      .post('/v1/transactions/' + txId)
      .query({ result: 'commit' })
      .reply(200, 'body')

      return tx.commit()
      .then(assertBasicResp)
    })

    it('should rollback a transaction', function () {
      var txId = '123'

      nock('http://example.com')
      .post('/v1/transactions')
      .reply(200, { 'transaction-status': { 'transaction-id': txId } })

      var tx = inst.transaction()
      expect(tx.status).to.equal('uninitialized')

      nock('http://example.com')
      .post('/v1/transactions/' + txId)
      .query({ result: 'rollback' })
      .reply(200, 'body')

      return tx.rollback()
      .then(assertBasicResp)
    })
  })
})
