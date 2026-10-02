import assert from 'node:assert';
import type {CallbackArgs} from '@natlibfi/fixugen';
import generateTests, {type Request} from './index.ts';

generateTests({
  useMetadataFile: true,
  callback,
  path: [import.meta.dirname, '..', 'test-fixtures']
});

function callback(callbackOpts: CallbackArgs) {
  const {getFixture} = callbackOpts;
  const requests = (callbackOpts['requests'] ?? []) as Request[];
  return iterate(requests);

  async function iterate(requests: Request[], index = 0) {
    const [request, ...rest] = requests;

    if (!request) {
      return;
    }

    const {method, url, query = '', status, requestHeaders = {}, responseHeaders = {}} = request;

    const expectedResponsePayload = getFixture(`response${index}.txt`) || '';
    const requestPayload = getFixture(`request${index}.txt`) as string | undefined;
    const response = await fetch(`http://foo.bar${url}${query}`, {method, headers: requestHeaders, body: requestPayload});

    assert.equal(response.status, status);
    assert.deepStrictEqual(formatResponseHeaders(response.headers), responseHeaders);
    assert.equal(await response.text(), expectedResponsePayload);

    return iterate(rest, index + 1);

    function formatResponseHeaders(headers: Headers) {
      const iterator = headers.entries();
      return iterate();

      function iterate(results: Record<string, string> = {}) {
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
