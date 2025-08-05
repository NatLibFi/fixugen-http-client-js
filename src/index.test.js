import assert from 'node:assert';
import generateTests from './index.js';

generateTests({
  callback,
  path: [import.meta.dirname, '..', 'test-fixtures']
});

function callback({getFixture, requests}) {
  return iterate(requests);

  async function iterate(requests, index = 0) {
    const [request, ...rest] = requests;

    if (request) {
      const {method, url, query = '', status, requestHeaders = {}, responseHeaders = {}} = request;

      const expectedResponsePayload = getFixture(`response${index}.txt`) || '';
      const requestPayload = getFixture(`request${index}.txt`);
      const response = await fetch(`http://foo.bar${url}${query}`, {method, headers: requestHeaders}, requestPayload);

      assert.equal(response.status, status);
      assert.deepStrictEqual(formatResponseHeaders(response.headers), responseHeaders);
      assert.equal(await response.text(), expectedResponsePayload);

      return iterate(rest, index + 1);
    }

    function formatResponseHeaders(headers) {
      const iterator = headers.entries();
      return iterate();

      function iterate(results = {}) {
        const {value, done} = iterator.next();

        if (done) {
          return results;
        }

        const [name, content] = value;
        return iterate({...results, [name]: content});
      }
    }
  }
}
