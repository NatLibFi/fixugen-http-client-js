import {expect} from 'chai';
import fetch from 'node-fetch';
import generateTests from '.';

generateTests({
  callback,
  path: [__dirname, '..', 'test-fixtures']
});

function callback({getFixture, requests}) {
  return iterate(requests);

  async function iterate(requests, index = 0) {
    const [request] = requests;

    if (request) {
      const {method, url, status, requestHeaders = {}, responseHeaders = {}} = request;

      const expectedResponsePayload = getFixture(`response${index}.txt`) || '';
      const requestPayload = getFixture(`request${index}.txt`);
      const response = await fetch(`http://foo.bar${url}`, {method, headers: requestHeaders}, requestPayload);

      expect(response.status).to.equal(status);
      expect(formatResponseHeaders(response.headers)).to.eql(responseHeaders);
      expect(await response.text()).to.equal(expectedResponsePayload);

      return iterate(requests.slice(1));
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
