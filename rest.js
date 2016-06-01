/* global define */
(function (self, factory) {
  'use strict'

  var g = typeof global === 'object' && global
  if (g.global === g || g.window === g || g.self === g) {
    self = g
  }

  if (typeof define === 'function' && define.amd) {
    define([], factory.bind(null, self))
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(self)
  } else {
    self.mlRestFactory = factory(self)
  }
}(this, function (self) {
  'use strict'

  /**
   * Provide dependencies to an MLRest factory/constructor
   *
   * @function mlRestFactory
   * @param {Object} [deps]
   * @prop {deps.external:fetch} [deps.fetch] - fetch polyfill
   * @prop {deps.external:Headers} [deps.Headers] - Headers polyfill
   * @prop {deps.external:Response} [deps.Response] - Response polyfill
   * @prop {deps.external:URL} [deps.URL] - URL polyfill
   * @prop {deps.external:URLSearchParams} [deps.URLSearchParams] - URLSearchParams polyfill
   * @throws {TypeError} if required dependencies are missing
   * @return {MLRest}
   */
  return function (deps) {
    deps = deps || {}

    /** @namespace deps */

    /**
     * a function for making HTTP requests: see
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch MDN}
     * for details. polyfill'd with {@link https://github.com/github/fetch github/fetch}
     * by default
     *
     * @memberof deps
     * @external fetch
     */
    var fetch = deps.fetch || self.fetch
    if (typeof fetch !== 'function') {
      throw new TypeError('missing dependency: fetch')
    }

    /**
     * an object for request Headers: see
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Headers MDN}
     * for details. polyfill'd with {@link https://github.com/github/fetch github/fetch}
     * by default
     *
     * @memberof deps
     * @external Headers
     */
    var Headers = deps.Headers || self.Headers
    if (typeof Headers !== 'function') {
      throw new TypeError('missing dependency: Headers')
    }

    /**
     * an object for an HTTP response: see
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response MDN}
     * for details. polyfill'd with {@link https://github.com/github/fetch github/fetch}
     * by default
     *
     * @memberof deps
     * @external Response
     */
    var Response = deps.Response || self.Response
    if (typeof Response !== 'function') {
      throw new TypeError('missing dependency: Response')
    }

    /**
     * a constructor for URLs: see
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/URL MDN}
     * for details. polyfill'd with {@link https://github.com/jsdom/whatwg-url jsdom/whatwg-url}
     * by default
     *
     * @memberof deps
     * @external URL
     */
    var URL = deps.URL || self.URL
    if (typeof URL !== 'function') {
      throw new TypeError('missing dependency: URL')
    }

    /**
     * an object for encoding and serializing URL params: see
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams MDN}
     * for details. polyfill'd with
     * {@link https://github.com/WebReflection/url-search-params WebReflection/url-search-params}
     * by default
     *
     * @memberof deps
     * @external URLSearchParams
     */
    var URLSearchParams = deps.URLSearchParams || self.URLSearchParams
    if (typeof URLSearchParams !== 'function') {
      throw new TypeError('missing dependency: URLSearchParams')
    }

    // TODO: replace Object.assign ?
    // if (!'assign' in Object) {
    //   throw new Error('missing Object.assign')
    // }

    /**
     * the result of an asynchronous computation or request:
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise MDN}
     * for details
     *
     * @memberof deps
     * @external Promise
     */
    // TODO: pass-in / override Promise

    // TODO: default CORS?
    var requestOpts = { credentials: 'same-origin' }

    /** @namespace MLRest */

    /**
     * Constructs an {@link MLRest} client
     *
     * @class MLRest
     * @constructor MLRest
     */
    function MLRest (options) {
      if (!(this instanceof MLRest)) {
        return new MLRest(options)
      }

      options = options || {}

      this.endpoint = options.endpoint || '/'
      this.version = options.version || 'v1'
      this.baseURI = options.baseURI || (document && document.baseURI)

      if (!this.baseURI) {
        throw new TypeError('missing base uri')
      }

      this.requestOpts = Object.assign({}, requestOpts, options.request)
    }

    /**
     * Creates an {@link MLRest} client
     *
     * @static
     * @memberof MLRest
     * @param {Object} [options]
     * @prop {String} [options.endpoint='/'] - the REST API endpoint
     * @prop {String} [options.version='v1'] - the REST API version
     * @prop {String} [options.baseURI=document.baseURI] - the base URI for REST API instance
     * @prop {Object} [options.request] - default args for {@link deps.external:fetch}
     * @return {MLRest}
     */
    MLRest.create = function (options) {
      return new MLRest(options)
    }

    /**
     * Returns an {@link deps.external:Promise} resolved with an {@link deps.external:Response}
     * @typedef "Promise&lt;Response&gt;"
     */

    MLRest.prototype._request = function (url, params, req) {
      validateArgs(url, params, req)
      url.search = params
      return fetch(url.toString(), req)
    }

    /**
     * Make an arbitrary REST request
     *
     * @method
     * @memberof MLRest
     * @param {String} endpoint
     * @param {Object|deps.external:URLSearchParams} [params]
     * @param {Object} [req]
     * @returns {"Promise&lt;Response&gt;"}
     */
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

    /**
     * Search for documents or metadata
     * @see http://docs.marklogic.com/REST/POST/v1/search
     *
     * @method
     * @memberof MLRest
     * @param {Object} [query] - a combined query
     * @param {Object|deps.external:URLSearchParams} [params] - request params
     * @returns {"Promise&lt;Response&gt;"}
     */
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

    /**
     * Get search phrase suggestions (for autocompletion)
     * @see http://docs.marklogic.com/REST/POST/v1/suggest
     *
     * @method
     * @memberof MLRest
     * @param {String} [prefix] - search phrase to match
     * @param {Object} [query] - a combined query
     * @param {Object|deps.external:URLSearchParams} [params] - request params
     * @returns {"Promise&lt;Response&gt;"}
     */
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

    /**
     * List the server-side values definitions
     * @see http://docs.marklogic.com/REST/GET/v1/values
     *
     * @method
     * @memberof MLRest
     * @param {Object|deps.external:URLSearchParams} [params] - request params
     * @returns {"Promise&lt;Response&gt;"}
     */
    MLRest.prototype.listValues = function (params) {
      return this.request('/values', params)
    }

    /**
     * Get values for the named definition
     * @see http://docs.marklogic.com/REST/POST/v1/values/[name]
     *
     * @method
     * @memberof MLRest
     * @param {String} name - values definition name
     * @param {Object} [query] - a combined query
     * @param {Object|deps.external:URLSearchParams} [params] - request params
     * @throws {TypeError} if name is not provided
     * @returns {"Promise&lt;Response&gt;"}
     */
    MLRest.prototype.values = function (name, query, params) {
      if (typeof name !== 'string') {
        throw new TypeError('missing values definition name')
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

    /**
     * Get a document
     * @see http://docs.marklogic.com/REST/GET/v1/documents
     *
     * @method
     * @memberof MLRest
     * @param {String} uri - document URI
     * @param {Object|deps.external:URLSearchParams} [params] - request params
     * @returns {"Promise&lt;Response&gt;"}
     */
    MLRest.prototype.doc = function (uri, params) {
      if (typeof uri !== 'string') {
        throw new TypeError('missing document URI')
      }

      params = toParams(params)
      params.set('uri', uri)

      return this.request('/documents', params)
    }

    /**
     * Create a document
     * @see http://docs.marklogic.com/REST/PUT/v1/documents
     * @see http://docs.marklogic.com/REST/POST/v1/documents
     * @see http://docs.marklogic.com/REST/POST/v1/documents@extension=[ext]
     *
     * @method
     * @memberof MLRest
     * @param {String} [uri] - document URI (generated server-side if not present)
     * @param content - document content
     * @param {Object|deps.external:URLSearchParams} [params] - request params
     * @returns {"Promise&lt;Response&gt;"}
     */
    MLRest.prototype.create = function (uri, content, params) {
      var method

      // TODO: support string docs as well
      // !== 'string' and check arguments.length?
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

    /**
     * Update a document
     * @see http://docs.marklogic.com/REST/PUT/v1/documents
     *
     * @method
     * @memberof MLRest
     * @param {String} uri - document URI
     * @param {Object} content - updated document contents
     * @param {Object|deps.external:URLSearchParams} [params] - request params
     * @returns {"Promise&lt;Response&gt;"}
     */
    MLRest.prototype.update = function (uri, content, params) {
      if (typeof uri !== 'string') {
        throw new TypeError('missing document URI')
      }

      params = toParams(params)
      params.set('uri', uri)

      return this.request('/documents', params, {
        method: 'PUT',
        body: JSON.stringify(content)
      })
    }

    /**
     * Delete a document
     * @see http://docs.marklogic.com/REST/DELETE/v1/documents
     *
     * @method
     * @memberof MLRest
     * @param {String} uri
     * @param {Object|deps.external:URLSearchParams} [params]
     * @returns {"Promise&lt;Response&gt;"}
     */
    MLRest.prototype.delete = function (uri, params) {
      if (typeof uri !== 'string') {
        throw new TypeError('missing document URI')
      }

      params = toParams(params)
      params.set('uri', uri)

      return this.request('/documents', params, {
        method: 'DELETE'
      })
    }

    /**
     * Delete multiple documents by URI, directory, or collection
     * @see http://docs.marklogic.com/REST/DELETE/v1/documents
     * @see http://docs.marklogic.com/REST/DELETE/v1/search
     *
     * @method
     * @memberof MLRest
     * @param {Array<String>} [uris] - document URIs
     * @param {Object|deps.external:URLSearchParams} [params] - request params
     * @returns {"Promise&lt;Response&gt;"}
     */
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

      throw new TypeError('bad args')
    }

    // TODO:
    MLRest.prototype.patch = function (uri, patch, params) {
      throw new Error('unimplemented')
    }

    /**
     * List all semantic graphs by name
     * @see http://docs.marklogic.com/REST/GET/v1/graphs
     *
     * @method
     * @memberof MLRest
     * @returns {"Promise&lt;Response&gt;"}
     */
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

    /**
     * Get the contents of a specified graph, or the default graph
     * @see http://docs.marklogic.com/REST/GET/v1/graphs
     *
     * @method
     * @memberof MLRest
     * @param {String} [uri] - graph URI
     * @param {Object|deps.external:URLSearchParams} [params] - request params
     * @returns {"Promise&lt;Response&gt;"}
     */
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

    // TODO: IRIs is optional!

    /**
     * Get triples related to the specified IRIs
     * @see http://docs.marklogic.com/REST/GET/v1/graphs/things
     *
     * @method
     * @memberof MLRest
     * @param {String|Array<String>} iris - one-or-more IRIs
     * @param {Object|deps.external:URLSearchParams} [params] - request params
     * @returns {"Promise&lt;Response&gt;"}
     */
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
        throw new TypeError('bad args')
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

    /**
     * List the server-side query options
     * @see http://docs.marklogic.com/REST/GET/v1/config/query
     *
     * @method
     * @memberof MLRest
     * @returns {"Promise&lt;Response&gt;"}
     */
    MLRest.prototype.listOptions = function () {
      return this.request('/config/query')
    }

    // TODO: support default

    /**
     * Get server-side options by name
     * @see http://docs.marklogic.com/REST/GET/v1/config/query/['default'-or-name]
     *
     * @method
     * @memberof MLRest
     * @param {String} name
     * @returns {"Promise&lt;Response&gt;"}
     */
    MLRest.prototype.options = function (name) {
      if (typeof name !== 'string') {
        throw new TypeError('missing name')
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

    /**
     * An instance of {@link MLRest} bound to a named database
     *
     * @memberof MLRest
     * @namespace Database
     */

    /**
     * Creates a {@link Database} instance with the same settings as `this`,
     * throws an Error `this` is a Database
     *
     * @method
     * @memberof MLRest
     * @param {String} name
     * @returns {Database}
     */
    MLRest.prototype.database = function (name) {
      if (typeof name !== 'string') {
        throw new TypeError('missing database name')
      }

      var db = new MLRest(this)

      db._request = function (url, params, req) {
        validateArgs(url, params, req)
        params.set('database', name)
        url.search = params
        return fetch(url.toString(), req)
      }

      // TODO: replace with error-throwing fn
      db.database = null

      return db
    }

    /**
     * Open a multi-statement transaction
     * @see http://docs.marklogic.com/REST/POST/v1/transactions
     *
     * @method
     * @memberof MLRest
     * @returns {"Promise&lt;Response&gt;"}
     */
    // TODO: name, params
    MLRest.prototype.openTransaction = function () {
      return this.request('/transactions', null, { method: 'POST' })
    }

    /**
     * Get the details of an open transaction
     * @see http://docs.marklogic.com/REST/GET/v1/transactions/[txid]
     *
     * @method
     * @memberof MLRest
     * @param {String} txId - transaction ID
     * @returns {"Promise&lt;Response&gt;"}
     */
    MLRest.prototype.transactionDetails = function (txId) {
      if (typeof txId !== 'string') {
        throw new TypeError('missing transaction id')
      }
      return this.request('/transactions/' + txId)
    }

    /**
     * Commit a multi-statement transaction
     * @see http://docs.marklogic.com/REST/POST/v1/transactions/[txid]
     *
     * @method
     * @memberof MLRest
     * @param {String} txId - transaction ID
     * @returns {"Promise&lt;Response&gt;"}
     */
    MLRest.prototype.commitTransaction = function (txId) {
      if (typeof txId !== 'string') {
        throw new TypeError('missing transaction id')
      }
      return this.request('/transactions/' + txId, { result: 'commit' }, {
        method: 'POST'
      })
    }

    /**
     * Rollback a multi-statement transaction
     * @see http://docs.marklogic.com/REST/POST/v1/transactions/[txid]
     *
     * @method
     * @memberof MLRest
     * @param {String} txId - transaction ID
     * @returns {"Promise&lt;Response&gt;"}
     */
    MLRest.prototype.rollbackTransaction = function (txId) {
      if (typeof txId !== 'string') {
        throw new TypeError('missing transaction id')
      }
      return this.request('/transactions/' + txId, { result: 'rollback' }, {
        method: 'POST'
      })
    }

    /**
     * An instance of {@link MLRest} representing a multi-statement transaction,
     * adds all subsequent requests to the transaction. Once committed or rolled-back,
     * all methods throw an Error.
     *
     * <p>supports all {@link MLRest} methods except {@link MLRest#transaction}
     * and {@link MLRest#suggest}</p>
     *
     * @memberof MLRest
     * @namespace Transaction
     * @prop {String} status - one of `['uninitialized', 'failed', 'open', 'committed', 'rolled-back']`
     */

    /**
     * Creates a {@link Transaction} instance with the same settings as `this`,
     * throws an Error if `this` is a Transaction
     *
     * @method
     * @memberof MLRest
     * @returns {Transaction}
     */
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

        if (!txId) throw new TypeError('unknown structure')
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

      /**
       * Get transaction details
       * @see MLRest#transactionDetails
       *
       * @function details
       * @memberof Transaction
       * @returns {"Promise&lt;Response&gt;"}
       */
      tx.details = function () {
        return txPromise.then(function () {
          return self.transactionDetails(txId)
        })
      }

      // TODO: collect all _request promises and
      // await them all before commit/rollback?

      /**
       * Commit this transaction
       * @see MLRest#commitTransaction
       *
       * @function commit
       * @memberof Transaction
       * @returns {"Promise&lt;Response&gt;"}
       */
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

      /**
       * Rollback this transaction
       * @see MLRest#rollbackTransaction
       *
       * @function rollback
       * @memberof Transaction
       * @returns {"Promise&lt;Response&gt;"}
       */
      tx.rollback = function () {
        return txPromise.then(function () {
          return self.rollbackTransaction(txId)
          .then(function (resp) {
            if (resp.ok) {
              done('rolled-back')
            } else {
              done('failed')
            }
            return resp
          })
        })
      }

      // remove methods
      // TODO: others?
      // TODO: replace with error-throwing fn
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
      if (!(url instanceof URL)) throw new TypeError('bad url')
      if (!(params instanceof URLSearchParams)) throw new TypeError('bad params')
      if (typeof req !== 'object') throw new TypeError('bad request')
    }

    return MLRest
  }
}))
