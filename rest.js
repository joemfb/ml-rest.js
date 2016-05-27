/* global fetch Headers Response URL URLSearchParams define */
(function (self, factory) {
  'use strict'

  if (typeof define === 'function' && define.amd) {
    define([], factory)
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory()
  } else {
    self.MLRest = factory()
  }
}(this, function () {
  'use strict'

  // var document = typeof document === 'object' ? document : null

  // https://www.npmjs.com/package/isomorphic-fetch

  if (typeof fetch !== 'function') {
    throw new Error('missing dependency: fetch')
  }
  if (typeof Headers !== 'function') {
    throw new Error('missing dependency: Headers')
  }
  if (typeof Response !== 'function') {
    throw new Error('missing dependency: Response')
  }
  if (typeof URL !== 'function') {
    throw new Error('missing dependency: URL')
  }
  if (typeof URLSearchParams !== 'function') {
    throw new Error('missing dependency: URLSearchParams')
  }
  // if (!'assign' in Object) {
  //   throw new Error('missing Object.assign')
  // }

  // window.Promise (removed)

  // TODO: default CORS?
  var requestOpts = { credentials: 'same-origin' }

  function MLRest (options) {
    if (!(this instanceof MLRest)) {
      return new MLRest(options)
    }

    options = options || {}

    this.endpoint = options.endpoint || '/'
    this.version = options.version || 'v1'
    this.baseURI = options.baseURI || (document && document.baseURI)

    if (!this.baseURI) {
      throw new Error('missing base uri')
    }

    this.requestOpts = Object.assign({}, requestOpts, options.request)
  }

  MLRest.create = function (options) {
    return new MLRest(options)
  }

  MLRest.prototype._request = function (url, params, req) {
    validateArgs(url, params, req)
    url.search = params
    return fetch(url.toString(), req)
  }

  MLRest.prototype.request = function (endpoint, params, req) {
    req = Object.assign({}, this.requestOpts, req)

    if (!req.headers) {
      req.headers = new Headers()
    } else if (!(req.headers instanceof Headers)) {
      req.headers = new Headers(req.headers)
    }

    if (!req.headers.has('Accept')) {
      req.headers.set('Accept', 'application/json')
    }
    if (!req.headers.has('Content-Type')) {
      req.headers.set('Content-Type', 'application/json')
    }

    var relativeURL

    if (/^\/v1\//.test(endpoint)) {
      // TODO: include this.endpoint ?
      relativeURL = endpoint
    } else {
      relativeURL = this.endpoint + this.version + (/^\//.test(endpoint) ? '' : '/') + endpoint
    }

    var url = new URL(relativeURL, this.baseURI)

    return this._request(url, toParams(params), req)
  }

  MLRest.prototype.search = function (query, params) {
    if (!params && query && !query.search) {
      params = query
      query = null
    }

    return this.request('/search', params, {
      method: 'POST',
      body: JSON.stringify(query)
    })
  }

  // TODO:
  MLRest.prototype.qbe = function (query, params) {
    throw new Error('unimplemented')
  }

  MLRest.prototype.suggest = function (prefix, query, params) {
    if (!params && query && !query.search) {
      params = query
      query = null
    }

    params = toParams(params)

    if (prefix) {
      params.set('partial-q', prefix)
    }

    return this.request('/suggest', params, {
      method: 'POST',
      body: JSON.stringify(query)
    })
  }

  MLRest.prototype.listValues = function (params) {
    return this.request('/values', params)
  }

  MLRest.prototype.values = function (name, query, params) {
    if (typeof name !== 'string') {
      throw new Error('missing values definition name')
    }

    if (!params && query && !query.search) {
      params = query
      query = null
    }

    return this.request('/values/' + name, params, {
      method: 'POST',
      body: JSON.stringify(query)
    })
  }

  MLRest.prototype.doc = function (uri, params) {
    if (typeof uri !== 'string') {
      throw new Error('missing document URI')
    }

    params = toParams(params)
    params.set('uri', uri)

    return this.request('/documents', params)
  }

  MLRest.prototype.create = function (uri, content, params) {
    var method

    if (typeof uri === 'object') {
      params = content
      content = uri
      uri = null
      method = 'POST'
    } else {
      method = 'PUT'
    }

    params = toParams(params)

    if (uri) {
      params.set('uri', uri)
    }

    return this.request('/documents', params, {
      method: method,
      body: JSON.stringify(content)
    })
  }

  MLRest.prototype.update = function (uri, content, params) {
    if (typeof uri !== 'string') {
      throw new Error('missing document URI')
    }

    params = toParams(params)
    params.set('uri', uri)

    return this.request('/documents', params, {
      method: 'PUT',
      body: JSON.stringify(content)
    })
  }

  MLRest.prototype.delete = function (uri, params) {
    if (typeof uri !== 'string') {
      throw new Error('missing document URI')
    }

    params = toParams(params)
    params.set('uri', uri)

    return this.request('/documents', params, {
      method: 'DELETE'
    })
  }

  MLRest.prototype.deleteAll = function (uris, params) {
    // TODO: every is string ...
    if (Array.isArray(uris)) {
      params = toParams(params)

      uris.forEach(function (uri) {
        params.append('uri', uri)
      })

      return this.request('/documents', params, {
        method: 'DELETE'
      })
    }

    if (!arguments.length || (!params && uris && typeof uris === 'object')) {
      return this.request('/search', toParams(uris), {
        method: 'DELETE'
      })
    }

    throw new Error('bad args')
  }

  // TODO:
  MLRest.prototype.patch = function (uri, patch, params) {
    throw new Error('unimplemented')
  }

  MLRest.prototype.listGraphs = function () {
    return this.request('/graphs', null, {
      method: 'GET',
      headers: { Accept: 'text/uri-list' }
    })
    .then(function (resp) {
      if (!resp.ok) return resp

      return resp.text().then(function (txt) {
        var data = txt.split(/\n/).filter(function (line) {
          return line.length
        })

        // note: this doesn't set URL
        return new Response(JSON.stringify(data), resp)
      })
    })
  }

  // TODO: debug
  MLRest.prototype.graph = function (uri, params) {
    if (!arguments.length || !params && typeof uri === 'object') {
      params = uri
      uri = null
    }

    params = toParams(params)

    if (uri) {
      params.set('graph', uri)
    } else {
      params.set('default', '')
    }

    return this.request('/graphs', params, {
      method: 'GET',
      headers: { 'Accept': 'application/rdf+json' }
    })
  }

  MLRest.prototype.things = function (iris, params) {
    params = toParams(params)

    if (typeof iris === 'string') {
      params.set('iri', iris)
      // TODO: every is string
    } else if (Array.isArray(iris)) {
      iris.forEach(function (iri) {
        params.append('iri', iri)
      })
    } else {
      throw new Error('bad args')
    }

    return this.request('/graphs/things', params, {
      method: 'GET',
      headers: { 'Accept': 'application/rdf+json' }
    })
  }

  // TODO: create/delete triples/graph

  // TODO:
  MLRest.prototype.sparql = function (query) {
    throw new Error('unimplemented')
  }

  // TODO: separate sparqlUpdate method?

  MLRest.prototype.listOptions = function () {
    return this.request('/config/query')
  }

  MLRest.prototype.options = function (name) {
    if (typeof name !== 'string') {
      throw new Error('missing name')
    }
    return this.request('/config/query/' + name)
  }

  // TODO:
  MLRest.prototype.extension = function (name, params) {
    throw new Error('unimplemented')
  }
  MLRest.prototype.eval = function (code, params) {
    throw new Error('unimplemented')
  }
  MLRest.prototype.invoke = function (uri, params) {
    throw new Error('unimplemented')
  }

  MLRest.prototype.database = function (name) {
    if (typeof name !== 'string') {
      throw new Error('missing database name')
    }

    var db = new MLRest(this)

    db._request = function (url, params, req) {
      validateArgs(url, params, req)
      params.set('database', name)
      url.search = params
      return fetch(url.toString(), req)
    }

    db.database = null

    return db
  }

  // TODO: name, params
  MLRest.prototype.openTransaction = function () {
    return this.request('/transactions', null, { method: 'POST' })
  }

  MLRest.prototype.transactionDetails = function (txId) {
    if (typeof txId !== 'string') {
      throw new Error('missing transaction id')
    }
    return this.request('/transactions/' + txId)
  }

  MLRest.prototype.commitTransaction = function (txId) {
    if (typeof txId !== 'string') {
      throw new Error('missing transaction id')
    }
    return this.request('/transactions/' + txId, { result: 'commit' }, {
      method: 'POST'
    })
  }

  MLRest.prototype.rollbackTransaction = function (txId) {
    if (typeof txId !== 'string') {
      throw new Error('missing transaction id')
    }
    return this.request('/transactions/' + txId, { result: 'rollback' }, {
      method: 'POST'
    })
  }

  // TODO: name, params
  MLRest.prototype.transaction = function () {
    var self = this
    var tx = new MLRest(self)
    var txId = null

    tx.status = 'uninitialized'

    function done (status) {
      tx.status = status
      txId = null

      function closed () {
        throw new Error('transaction closed: ' + status)
      }

      tx.details = closed
      tx.commit = closed
      tx.rollback = closed
      tx._request = closed
      // txPromise = Promise.reject()
    }

    // open new transaction
    var txPromise = self.openTransaction()
    .then(function (resp) {
      if (!resp.ok) throw new Error('bad response')

      return resp.json()
    })
    .then(function (details) {
      tx.status = 'open'
      txId = details && details['transaction-status'] &&
             details['transaction-status']['transaction-id']

      if (!txId) throw new Error('unknown structure')
    })
    .catch(function (err) {
      done('failed')
      throw new Error(err)
    })

    tx._request = function (url, params, req) {
      validateArgs(url, params, req)
      // block requests until transaction is opened
      return txPromise.then(function () {
        params.set('txid', txId)
        url.search = params
        return fetch(url.toString(), req)
      })
    }

    // add tx methods
    tx.details = function () {
      return txPromise.then(function () {
        return self.transactionDetails(txId)
      })
    }

    // TODO: collect all _request promises and
    // await them all before commit/rollback?

    tx.commit = function () {
      return txPromise.then(function () {
        return self.commitTransaction(txId)
        .then(function (resp) {
          if (resp.ok) {
            done('committed')
          } else {
            done('failed')
          }
          return resp
        })
      })
    }

    tx.rollback = function () {
      return txPromise.then(function () {
        return self.rollbackTransaction(txId)
        .then(function (resp) {
          if (resp.ok) {
            done('committed')
          } else {
            done('failed')
          }
          return resp
        })
      })
    }

    // remove methods
    // TODO: others?
    tx.transaction = null
    tx.suggest = null

    return tx
  }

  /* utility functions */

  function toParams (arg) {
    if (arg instanceof URLSearchParams) return arg

    var params = new URLSearchParams()

    if (arg && typeof arg === 'object') {
      Object.keys(arg).forEach(function (key) {
        var val = arg[key]

        if (val == null) return

        if (Array.isArray(val)) {
          val.forEach(function (val) {
            params.append(key, val)
          })
        } else {
          params.set(key, val)
        }
      })
    }

    return params
  }

  function validateArgs (url, params, req) {
    if (!(url instanceof URL)) throw new Error('bad url')
    if (!(params instanceof URLSearchParams)) throw new Error('bad params')
    if (typeof req !== 'object') throw new Error('bad request')
  }

  return MLRest
}))
