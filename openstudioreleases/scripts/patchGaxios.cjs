// Intercept all require('node-fetch') calls and replace with native fetch.
// node-fetch v2 has a gzip decompression bug (ERR_STREAM_PREMATURE_CLOSE)
// on newer Node.js versions. Native fetch works correctly.
//
// Also patch 'abort-controller' to return the native AbortController/AbortSignal.
// The npm polyfill creates a different class than the global, so native fetch
// rejects signals from it with "Expected signal to be an instance of AbortSignal".
const Module = require('module');
const originalLoad = Module._load;

Module._load = function (request, parent, isMain) {
  if (request === 'node-fetch') {
    // Native fetch in Node 22 requires `duplex: 'half'` when the body is a stream.
    // Gaxios v6 doesn't set this, so we inject it automatically.
    const nativeFetch = function(url, init) {
      if (init && init.body && !init.duplex) {
        init = { ...init, duplex: 'half' };
      }
      return globalThis.fetch(url, init);
    };
    nativeFetch.default = nativeFetch;
    return nativeFetch;
  }
  if (request === 'abort-controller') {
    // Return an ESM-shaped module with both a default export and named exports so that
    // TypeScript's __importDefault (expects { default: ... }) and callers that use named
    // imports (`const { AbortController, AbortSignal } = require('abort-controller')`) both
    // work correctly with the native globals.
    return {
      __esModule: true,
      default: globalThis.AbortController,
      AbortController: globalThis.AbortController,
      AbortSignal: globalThis.AbortSignal,
    };
  }
  return originalLoad.apply(this, arguments);
};
