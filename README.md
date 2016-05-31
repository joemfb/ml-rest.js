### ml-rest.js

a lightweight JS client for the MarkLogic REST API, built on modern browser APIs [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).

install from npm

```sh
npm install ml-rest.js
```

By default, any missing dependencies are polyfilled for node and the browser:

```js
var MLRest = require('ml-rest.js')
var client = MLRest.create()
```

Alternately, `rest.js` (a UMD module) can be used directly. It exports a factory, optionally taking dependencies, and returns the client constructor/factory:

```html
<script src="path/to/rest.js"></script>
<script>
  var MLRest = window.mlRestFactory()
  var client = MLRest.create()
</script>
```

This module is pre-release, and subject to change.
